import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import { PGlite } from "@electric-sql/pglite";

test("verification migration protects tokens and returns only minimal live order metadata", async () => {
  const db = new PGlite();
  try {
    const foundation = fs.readFileSync(new URL("../supabase/migrations/202610120001_store_foundation.sql", import.meta.url), "utf8");
    await db.exec(`
      create role anon; create role authenticated; create role service_role bypassrls;
      create schema auth; create table auth.users(id uuid primary key);
      create function auth.uid() returns uuid language sql as $$
        select nullif(current_setting('test.auth_uid', true), '')::uuid;
      $$;
      grant usage on schema public, auth to anon, authenticated, service_role;
      grant execute on function auth.uid() to authenticated;
      create type public.store_role as enum ('owner', 'admin', 'catalog_manager', 'order_manager', 'marketing_manager');
      create type public.order_status as enum ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded');
      create type public.payment_method as enum ('cash_on_delivery', 'online_card');
      create type public.payment_status as enum ('pending', 'paid', 'failed', 'refunded');
      ${foundation.slice(foundation.indexOf("create table public.staff_roles ("), foundation.indexOf("create table public.order_items ("))}
      alter table public.orders enable row level security;
      ${foundation.slice(foundation.indexOf("create policy orders_read_customer_or_staff"), foundation.indexOf("create policy orders_manage_staff"))}
      grant select on public.orders to authenticated;
      grant all on public.orders to service_role;
      insert into auth.users values ('00000000-0000-0000-0000-000000000001'), ('00000000-0000-0000-0000-000000000002'), ('00000000-0000-0000-0000-000000000003');
      insert into public.staff_roles(user_id, role) values ('00000000-0000-0000-0000-000000000003', 'order_manager');
      insert into public.orders(id, order_number, user_id, customer_name, customer_phone, total)
        values ('10000000-0000-0000-0000-000000000001','TEST-1','00000000-0000-0000-0000-000000000001','Private name','Private phone',230);
    `);
    await db.exec(fs.readFileSync(new URL("../supabase/migrations/202611160002_invoice_verification.sql", import.meta.url), "utf8"));
    const [{ token }] = (await db.query("select token from public.invoice_verifications")).rows;
    assert.match(token, /^[0-9a-f]{64}$/);
    await db.exec("set role anon");
    await assert.rejects(db.query("select * from public.invoice_verifications"), /permission denied/);
    await assert.rejects(db.query("select public.get_invoice_verification_token('TEST-1')"), /permission denied/);
    const result = (await db.query("select public.verify_invoice($1) as record", [token])).rows[0].record;
    assert.deepEqual(Object.keys(result).sort(), ["invoice_number", "issued_at", "status"]);
    assert.equal(result.invoice_number, "INV-TEST-1");
    assert.equal((await db.query("select public.verify_invoice($1) as record", ["f".repeat(64)])).rows[0].record, null);
    await assert.rejects(db.query("select public.verify_invoice('TEST-1')"), /Invalid verification token/);
    await db.exec("reset role; set role authenticated; set test.auth_uid = '00000000-0000-0000-0000-000000000001'");
    assert.equal((await db.query("select public.get_invoice_verification_token('TEST-1') as token")).rows[0].token, token);
    await assert.rejects(db.query("update public.invoice_verifications set token = $1", ["e".repeat(64)]), /permission denied/);
    await assert.rejects(db.query("insert into public.invoice_verifications(order_id) values ('10000000-0000-0000-0000-000000000001')"), /permission denied/);
    assert.equal((await db.query("update public.invoice_verifications set revoked_at = now() returning order_id")).rows.length, 0);
    await db.exec("set test.auth_uid = '00000000-0000-0000-0000-000000000002'");
    assert.equal((await db.query("select public.get_invoice_verification_token('TEST-1') as token")).rows[0].token, null);
    assert.equal((await db.query("select * from public.invoice_verifications")).rows.length, 0);
    await db.exec("set test.auth_uid = '00000000-0000-0000-0000-000000000003'");
    assert.equal((await db.query("select public.get_invoice_verification_token('TEST-1') as token")).rows[0].token, token);
    await db.exec("reset role; update public.orders set status = 'cancelled' where order_number = 'TEST-1'; set role anon");
    assert.equal((await db.query("select public.verify_invoice($1) as record", [token])).rows[0].record.status, "cancelled");
    await db.exec("reset role; set role authenticated; set test.auth_uid = '00000000-0000-0000-0000-000000000003'; update public.invoice_verifications set revoked_at = now(); set role anon");
    assert.equal((await db.query("select public.verify_invoice($1) as record", [token])).rows[0].record, null);
    await db.exec(`reset role; insert into public.orders(order_number,customer_name,customer_phone)
      select 'NEW-' || n, 'Test','Test' from generate_series(1,20) n;`);
    const generated = (await db.query("select token from public.invoice_verifications")).rows;
    assert.equal(generated.length, 21);
    assert.equal(new Set(generated.map((row) => row.token)).size, 21);
    await db.exec("begin; insert into public.orders(order_number,customer_name,customer_phone) values ('ROLLBACK','Test','Test'); rollback;");
    assert.equal((await db.query("select count(*)::integer as n from public.invoice_verifications")).rows[0].n, 21);
    await db.exec("delete from public.orders where order_number like 'NEW-%'");
    assert.equal((await db.query("select count(*)::integer as n from public.invoice_verifications")).rows[0].n, 1);
  } finally {
    await db.close();
  }
});

test("verification page handles missing, malformed, revoked, cancelled and failed records without rendering personal data", async () => {
  const source = fs.readFileSync(new URL("../public/js/invoice-verify.js", import.meta.url), "utf8");
  async function fixture(hash, response) {
    const nodes = new Map();
    const events = {};
    let calls = 0;
    const document = {
      documentElement: {},
      getElementById(id) {
        if (!nodes.has(id)) nodes.set(id, { dataset: {}, addEventListener: (event, fn) => { events[`${id}:${event}`] = fn; } });
        return nodes.get(id);
      },
      querySelectorAll: () => [],
    };
    const window = {
      location: { search: "?lang=ar", hash },
      RUQO_SUPABASE_CONFIG: { url: "https://example.invalid", publishableKey: "public-test-key" },
      supabase: { createClient: () => ({ rpc: () => ({ abortSignal: async () => { calls++; return response; } }) }) },
      addEventListener: (event, fn) => { events[event] = fn; },
    };
    vm.runInNewContext(source, { window, document, URLSearchParams, Intl, AbortSignal, console: { error() {} } });
    await new Promise((resolve) => setImmediate(resolve));
    return { nodes, events, document, window, calls };
  }
  for (const hash of ["", "#TEST-1", "#<script>"]) {
    const f = await fixture(hash, { data: null });
    assert.equal(f.calls, 0);
    assert.equal(f.nodes.get("verification-status").dataset.state, "invalid");
    assert.equal(f.nodes.get("verification-record").hidden, true);
  }
  const hash = `#${"a".repeat(64)}`;
  for (const response of [{ error: {} }, { data: {} }, { data: { invoice_number: "INV-1", issued_at: "invalid", status: "pending" } }]) {
    const f = await fixture(hash, response);
    assert.equal(f.nodes.get("verification-status").dataset.state, "error");
    assert.equal(f.nodes.get("verification-retry").hidden, false);
    assert.equal(f.nodes.get("verification-record").hidden, true);
  }
  const missing = await fixture(hash, { data: null });
  assert.equal(missing.nodes.get("verification-status").dataset.state, "missing");
  for (const status of ["pending", "delivered", "cancelled", "refunded"]) {
    const f = await fixture(hash, { data: {
      invoice_number: "INV-<img src=x onerror=alert(1)>", issued_at: "2026-11-16T12:00:00Z", status,
      customer_name: "Must not display", customer_phone: "Must not display",
    } });
    assert.equal(f.nodes.get("verification-status").dataset.state, ["cancelled", "refunded"].includes(status) ? "cancelled" : "found");
    assert.equal(f.nodes.get("verification-number").textContent, "INV-<img src=x onerror=alert(1)>");
    assert.equal(f.nodes.get("verification-record").hidden, false);
    assert.ok([...f.nodes.values()].every((node) => !String(node.textContent).includes("Must not display")));
    for (const language of ["ar", "en", "fr", "es", "zh"]) {
      f.nodes.get("verification-language").value = language;
      f.events["verification-language:change"]();
      assert.equal(f.document.documentElement.dir, language === "ar" ? "rtl" : "ltr");
    }
  }
});
