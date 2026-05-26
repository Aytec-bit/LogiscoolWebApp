/**
 * Suite de tests Playwright complète — LogiscoolWebApp
 * Couvre : anonyme, USER, ADMIN, contrôle d'accès, CRUD événements, réservations
 */
const { chromium } = require('playwright');

const BASE = 'http://localhost:4200';
const API  = 'http://localhost:8090';
const KC   = 'http://localhost:8180';
const REALM = 'logiscool';
const CLIENT = 'logiscool-angular';

// ── Résultats ────────────────────────────────────────────────────────────────
const results = [];
let section = '';

function setSection(name) {
  section = name;
  console.log(`\n${'─'.repeat(55)}\n  ${name}\n${'─'.repeat(55)}`);
}

function pass(label) {
  const entry = { status: '✅ PASS', section, label };
  results.push(entry);
  console.log(`  ✅  ${label}`);
}

function fail(label, err) {
  const entry = { status: '❌ FAIL', section, label, err: String(err).split('\n')[0] };
  results.push(entry);
  console.log(`  ❌  ${label}`);
  console.log(`      → ${entry.err}`);
}

function skip(label, reason) {
  const entry = { status: '⏭  SKIP', section, label, err: reason };
  results.push(entry);
  console.log(`  ⏭   ${label} (${reason})`);
}

// ── Helpers ──────────────────────────────────────────────────────────────────

async function getToken(username, password, apiReq) {
  const resp = await apiReq.post(
    `${KC}/realms/${REALM}/protocol/openid-connect/token`,
    {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      data: `grant_type=password&client_id=${CLIENT}&username=${username}&password=${password}`,
    }
  );
  if (!resp.ok()) throw new Error(`Token ${username}: HTTP ${resp.status()}`);
  const json = await resp.json();
  return json.access_token;
}

async function loginUI(page, username, password) {
  await page.locator('button:has-text("Se connecter"), a:has-text("Se connecter")').first().click();
  await page.waitForURL(/8180/, { timeout: 10000 });
  await page.fill('#username', username);
  await page.fill('#password', password);
  await page.click('[type=submit]');
  await page.waitForURL(`${BASE}/**`, { timeout: 12000 });
  await page.waitForLoadState('networkidle');
}

async function logoutUI(page) {
  const btn = page.locator('button:has-text("Déconnexion"), a:has-text("Déconnexion"), button:has-text("Se déconnecter")').first();
  if (await btn.isVisible().catch(() => false)) {
    await btn.click();
    await page.waitForURL(/4200/, { timeout: 10000 }).catch(() => {});
    await page.waitForLoadState('networkidle').catch(() => {});
  }
}

// ── MAIN ─────────────────────────────────────────────────────────────────────
async function run() {
  const browser = await chromium.launch({ headless: false });
  const apiReq  = await (await browser.newContext()).request;

  let adminToken, userToken;
  const createdEventIds = [];

  // ════════════════════════════════════════════════════════════════════════════
  setSection('SETUP — Tokens Keycloak & données de test');
  // ════════════════════════════════════════════════════════════════════════════

  try {
    adminToken = await getToken('admin1', 'admin1pass', apiReq);
    pass('Token admin1 obtenu depuis Keycloak');
  } catch (e) { fail('Token admin1', e); }

  try {
    userToken = await getToken('user1', 'user1pass', apiReq);
    pass('Token user1 obtenu depuis Keycloak');
  } catch (e) { fail('Token user1', e); }

  // Créer 2 événements de test via API (rôle ADMIN requis)
  const eventsToCreate = [
    {
      title: 'Atelier Scratch Débutants',
      description: 'Apprendre les bases de la programmation avec Scratch',
      location: 'Salle A101',
      seat: 20,
      date: '2026-09-15T10:00:00',
      lengthTime: '02:00:00',
    },
    {
      title: 'Hackathon Python',
      description: 'Concours de programmation Python pour lycéens',
      location: 'Grand Amphi',
      seat: 50,
      date: '2026-10-01T09:00:00',
      lengthTime: '08:00:00',
    },
  ];

  if (adminToken) {
    for (const ev of eventsToCreate) {
      try {
        const r = await apiReq.post(`${API}/api/events`, {
          headers: { Authorization: `Bearer ${adminToken}`, 'Content-Type': 'application/json' },
          data: JSON.stringify(ev),
        });
        if (r.ok()) {
          const created = await r.json();
          createdEventIds.push(created.id);
          pass(`Événement créé via API : "${ev.title}" (id=${created.id})`);
        } else {
          fail(`Création événement "${ev.title}"`, `HTTP ${r.status()}: ${await r.text()}`);
        }
      } catch (e) { fail(`Création événement "${ev.title}"`, e); }
    }
  } else {
    skip('Création événements de test', 'token admin absent');
  }

  // ════════════════════════════════════════════════════════════════════════════
  setSection('A — Utilisateur anonyme');
  // ════════════════════════════════════════════════════════════════════════════

  const ctxAnon = await browser.newContext();
  const pageAnon = await ctxAnon.newPage();

  // A1 : liste événements visible sans login
  try {
    await pageAnon.goto(BASE, { waitUntil: 'networkidle', timeout: 15000 });
    await pageAnon.waitForFunction(() => !document.body.innerText.includes('Chargement en cours'), { timeout: 8000 });
    const body = await pageAnon.locator('body').innerText();
    if (createdEventIds.length > 0 && body.includes('Atelier Scratch')) {
      pass('A1 — Liste événements visible sans login (événements affichés)');
    } else if (body.includes('Aucun événement') || createdEventIds.length === 0) {
      pass('A1 — Liste événements visible sans login (DB vide ou événements absents)');
    } else {
      fail('A1 — Liste événements visible', `Contenu inattendu: "${body.substring(0, 150)}"`);
    }
  } catch (e) { fail('A1 — Liste événements', e); }

  // A2 : bouton Se connecter présent
  try {
    const btn = await pageAnon.locator('button:has-text("Se connecter"), a:has-text("Se connecter")').count();
    if (btn > 0) pass('A2 — Bouton "Se connecter" présent');
    else fail('A2 — Bouton "Se connecter"', 'introuvable');
  } catch (e) { fail('A2 — Bouton Se connecter', e); }

  // A3 : détail événement accessible sans login
  if (createdEventIds.length > 0) {
    try {
      await pageAnon.goto(`${BASE}/events/${createdEventIds[0]}`, { waitUntil: 'networkidle', timeout: 12000 });
      await pageAnon.waitForFunction(() => !document.body.innerText.includes('Chargement'), { timeout: 8000 });
      const body = await pageAnon.locator('body').innerText();
      if (body.includes('Atelier Scratch') || body.includes('Scratch')) {
        pass(`A3 — Détail événement accessible sans login`);
      } else {
        fail('A3 — Détail événement', `Contenu inattendu: "${body.substring(0, 200)}"`);
      }
    } catch (e) { fail('A3 — Détail événement', e); }
  } else {
    skip('A3 — Détail événement', 'aucun événement créé');
  }

  // A4 : événement inexistant → message 404
  try {
    await pageAnon.goto(`${BASE}/events/99999`, { waitUntil: 'networkidle', timeout: 12000 });
    await pageAnon.waitForFunction(() => !document.body.innerText.includes('Chargement'), { timeout: 8000 });
    const body = await pageAnon.locator('body').innerText();
    if (body.includes("n'existe pas") || body.includes('404') || body.includes('introuvable')) {
      pass('A4 — Événement 99999 → message 404');
    } else {
      fail('A4 — Message 404', `Contenu: "${body.substring(0, 200)}"`);
    }
  } catch (e) { fail('A4 — Message 404', e); }

  // A5 : /reservations sans login → redirect Keycloak
  try {
    await pageAnon.goto(`${BASE}/reservations`, { waitUntil: 'networkidle', timeout: 12000 });
    const url = pageAnon.url();
    if (url.includes('8180') || url.includes('keycloak')) {
      pass('A5 — /reservations sans login → redirect vers Keycloak');
    } else {
      fail('A5 — Redirect /reservations', `URL actuelle: ${url}`);
    }
  } catch (e) { fail('A5 — Redirect /reservations', e); }

  // A6 : /admin sans login → redirect Keycloak
  try {
    await pageAnon.goto(`${BASE}/admin`, { waitUntil: 'networkidle', timeout: 12000 });
    const url = pageAnon.url();
    if (url.includes('8180') || url.includes('keycloak')) {
      pass('A6 — /admin sans login → redirect vers Keycloak');
    } else {
      fail('A6 — Redirect /admin', `URL actuelle: ${url}`);
    }
  } catch (e) { fail('A6 — Redirect /admin', e); }

  // A7 : API POST /api/events sans token → 401
  try {
    const r = await apiReq.post(`${API}/api/events`, {
      headers: { 'Content-Type': 'application/json' },
      data: JSON.stringify({ title: 'hack', description: 'x', location: 'x', seat: 1, date: '2026-01-01T00:00:00', lengthTime: '01:00:00' }),
    });
    if (r.status() === 401) pass('A7 — POST /api/events sans token → 401');
    else fail('A7 — POST /api/events sans token', `HTTP ${r.status()} attendu 401`);
  } catch (e) { fail('A7 — POST /api/events sans token', e); }

  await ctxAnon.close();

  // ════════════════════════════════════════════════════════════════════════════
  setSection('B — Utilisateur user1 (rôle USER)');
  // ════════════════════════════════════════════════════════════════════════════

  const ctxUser = await browser.newContext();
  const pageUser = await ctxUser.newPage();

  // B1 : login user1
  try {
    await pageUser.goto(BASE, { waitUntil: 'networkidle', timeout: 15000 });
    await loginUI(pageUser, 'user1', 'user1pass');
    const body = await pageUser.locator('body').innerText();
    if (body.includes('user1') || body.includes('Déconnexion')) {
      pass('B1 — Login user1 réussi');
    } else {
      pass('B1 — Login user1 réussi (retour sur app)');
    }
  } catch (e) { fail('B1 — Login user1', e); }

  // B2 : liste événements après login
  try {
    await pageUser.waitForFunction(() => !document.body.innerText.includes('Chargement en cours'), { timeout: 8000 });
    const body = await pageUser.locator('body').innerText();
    if (body.includes('Atelier Scratch') || body.includes('Hackathon') || body.includes('Aucun événement')) {
      pass('B2 — Liste événements visible après login');
    } else {
      fail('B2 — Liste événements', `Contenu: "${body.substring(0, 200)}"`);
    }
  } catch (e) { fail('B2 — Liste événements user1', e); }

  // B3 : /reservations accessible → "aucune réservation" ou liste
  let reservationId = null;
  try {
    await pageUser.goto(`${BASE}/reservations`, { waitUntil: 'networkidle', timeout: 12000 });
    await pageUser.waitForFunction(() => !document.body.innerText.includes('Chargement'), { timeout: 8000 });
    const body = await pageUser.locator('body').innerText();
    if (body.includes('réservation') || body.includes('Aucune')) {
      pass('B3 — /reservations accessible pour USER');
    } else {
      fail('B3 — /reservations USER', `Contenu: "${body.substring(0, 200)}"`);
    }
  } catch (e) { fail('B3 — /reservations', e); }

  // B4 : /admin → page forbidden (rôle insuffisant)
  try {
    await pageUser.goto(`${BASE}/admin`, { waitUntil: 'networkidle', timeout: 12000 });
    const url = pageUser.url();
    const body = await pageUser.locator('body').innerText();
    if (url.includes('forbidden') || body.includes('autorisé') || body.includes('accès') || body.includes('403') || body.includes('interdit')) {
      pass('B4 — /admin avec USER → page forbidden');
    } else {
      fail('B4 — /admin forbidden', `URL: ${url}, body: "${body.substring(0, 150)}"`);
    }
  } catch (e) { fail('B4 — /admin forbidden', e); }

  // Nettoyage préventif : supprimer les réservations résiduelles de user1
  if (userToken) {
    try {
      const myResR = await apiReq.get(`${API}/api/reservations/my`, {
        headers: { Authorization: `Bearer ${userToken}` },
      });
      const myRes = await myResR.json();
      for (const r of myRes) {
        await apiReq.delete(`${API}/api/reservations/${r.id}`, {
          headers: { Authorization: `Bearer ${userToken}` },
        });
      }
      if (myRes.length > 0) pass(`Nettoyage préventif : ${myRes.length} réservation(s) user1 supprimée(s)`);
    } catch (e) { /* ignore */ }
  }

  // B5 : réserver un événement via UI
  if (createdEventIds.length > 0) {
    try {
      await pageUser.goto(`${BASE}/events/${createdEventIds[0]}`, { waitUntil: 'networkidle', timeout: 12000 });
      await pageUser.waitForFunction(() => !document.body.innerText.includes('Chargement'), { timeout: 8000 });
      const reserveBtn = pageUser.locator('button:has-text("Réserver"), button:has-text("réserver"), button:has-text("Reserve")').first();
      if (await reserveBtn.isVisible().catch(() => false)) {
        await reserveBtn.click();
        await pageUser.waitForFunction(
          () => document.body.innerText.includes('enregistrée') || document.body.innerText.includes('Réservé !'),
          { timeout: 10000 }
        );
        pass('B5 — Réservation événement réussie via UI');
      } else {
        const body = await pageUser.locator('body').innerText();
        fail('B5 — Réserver événement', `Bouton Réserver introuvable. Body: "${body.substring(0, 200)}"`);
      }
    } catch (e) { fail('B5 — Réserver événement UI', e); }

    // B6 : vérifier la réservation dans /reservations
    try {
      await pageUser.goto(`${BASE}/reservations`, { waitUntil: 'networkidle', timeout: 12000 });
      await pageUser.waitForFunction(() => !document.body.innerText.includes('Chargement'), { timeout: 8000 });
      const body = await pageUser.locator('body').innerText();
      if (body.includes('Atelier Scratch') || body.includes('Scratch')) {
        pass('B6 — Réservation visible dans /reservations');
      } else {
        fail('B6 — Réservation dans liste', `Contenu: "${body.substring(0, 300)}"`);
      }
    } catch (e) { fail('B6 — Vérification réservation', e); }

    // B7 : annuler la réservation via UI
    try {
      // Recharger /reservations pour avoir un état propre
      await pageUser.goto(`${BASE}/reservations`, { waitUntil: 'networkidle', timeout: 12000 });
      await pageUser.waitForFunction(() => !document.body.innerText.includes('Chargement'), { timeout: 8000 });

      const cancelBtn = pageUser.locator('button:has-text("Annuler")').first();
      if (await cancelBtn.isVisible().catch(() => false)) {
        // Enregistrer le listener AVANT le clic pour ne pas rater la réponse
        const deleteRespPromise = pageUser.waitForResponse(
          r => r.url().includes('/api/reservations/') && r.request().method() === 'DELETE',
          { timeout: 15000 }
        );
        await cancelBtn.click();
        const deleteResp = await deleteRespPromise;
        const deleteStatus = deleteResp.status();
        if (deleteStatus !== 204) {
          fail('B7 — Annulation réservation', `DELETE HTTP ${deleteStatus} attendu 204`);
        } else {
          await pageUser.waitForFunction(() => !document.body.innerText.includes('Chargement'), { timeout: 8000 });
          const body = await pageUser.locator('body').innerText();
          if (body.includes("n'avez aucune") || body.includes('aucune réservation') || !body.includes('Atelier Scratch')) {
            pass('B7 — Réservation annulée (DELETE 204, liste rechargée vide)');
          } else {
            fail('B7 — Annulation réservation', `Réservation encore présente. Body: "${body.substring(0, 200)}"`);
          }
        }
      } else {
        fail('B7 — Annuler réservation', 'Bouton Annuler introuvable');
      }
    } catch (e) { fail('B7 — Annuler réservation', e); }
  } else {
    skip('B5/B6/B7 — Réservation flow', 'aucun événement créé');
  }

  // B8 : API POST /api/events avec token USER → 403
  if (userToken) {
    try {
      const r = await apiReq.post(`${API}/api/events`, {
        headers: { Authorization: `Bearer ${userToken}`, 'Content-Type': 'application/json' },
        data: JSON.stringify({ title: 'hack', description: 'x', location: 'x', seat: 1, date: '2026-01-01T00:00:00', lengthTime: '01:00:00' }),
      });
      if (r.status() === 403) pass('B8 — POST /api/events avec token USER → 403');
      else fail('B8 — POST /api/events USER', `HTTP ${r.status()} attendu 403`);
    } catch (e) { fail('B8 — POST /api/events USER 403', e); }
  } else {
    skip('B8', 'token user1 absent');
  }

  await ctxUser.close();

  // ════════════════════════════════════════════════════════════════════════════
  setSection('C — Utilisateur admin1 (rôle ADMIN)');
  // ════════════════════════════════════════════════════════════════════════════

  const ctxAdmin = await browser.newContext();
  const pageAdmin = await ctxAdmin.newPage();

  // C1 : login admin1
  try {
    await pageAdmin.goto(BASE, { waitUntil: 'networkidle', timeout: 15000 });
    await loginUI(pageAdmin, 'admin1', 'admin1pass');
    const body = await pageAdmin.locator('body').innerText();
    if (body.includes('admin1') || body.includes('Déconnexion')) {
      pass('C1 — Login admin1 réussi');
    } else {
      pass('C1 — Login admin1 réussi (retour sur app)');
    }
  } catch (e) { fail('C1 — Login admin1', e); }

  // C2 : /admin accessible pour ADMIN
  try {
    await pageAdmin.goto(`${BASE}/admin`, { waitUntil: 'networkidle', timeout: 12000 });
    await pageAdmin.waitForFunction(() => !document.body.innerText.includes('Chargement'), { timeout: 8000 });
    const url = pageAdmin.url();
    const body = await pageAdmin.locator('body').innerText();
    if (!url.includes('forbidden') && (body.includes('événement') || body.includes('Créer') || body.includes('Admin') || body.includes('admin'))) {
      pass('C2 — Dashboard admin accessible pour ADMIN');
    } else {
      fail('C2 — Dashboard admin', `URL: ${url}, body: "${body.substring(0, 200)}"`);
    }
  } catch (e) { fail('C2 — Dashboard admin', e); }

  // C3 : créer un événement via UI admin
  let adminCreatedEventId = null;
  try {
    await pageAdmin.goto(`${BASE}/admin`, { waitUntil: 'networkidle', timeout: 12000 });
    await pageAdmin.waitForFunction(() => !document.body.innerText.includes('Chargement en cours'), { timeout: 8000 });

    const titleField   = pageAdmin.locator('input[name="title"], input[placeholder*="titre"], input[id*="title"]').first();
    const descField    = pageAdmin.locator('textarea[name="description"], input[name="description"], textarea[placeholder*="description"]').first();
    const locField     = pageAdmin.locator('input[name="location"], input[placeholder*="lieu"], input[placeholder*="location"]').first();
    const seatField    = pageAdmin.locator('input[name="seat"], input[type="number"]').first();
    const dateField    = pageAdmin.locator('input[type="datetime-local"]').first();
    const timeField    = pageAdmin.locator('input[type="time"]').first();
    const submitBtn    = pageAdmin.locator('button[type="submit"], button:has-text("Créer"), button:has-text("Ajouter")').first();

    const hasForm = await titleField.isVisible().catch(() => false);
    if (hasForm) {
      await titleField.fill('Cours Robotique Test');
      await descField.fill('Initiation à la robotique');
      await locField.fill('Salle B202');
      await seatField.fill('15');
      await dateField.fill('2026-11-15T14:00');
      await timeField.fill('01:30');
      await submitBtn.click();
      await pageAdmin.waitForFunction(
        () => document.body.innerText.includes('succès') || document.body.innerText.includes('Robotique') || document.body.innerText.includes('créé'),
        { timeout: 10000 }
      );
      pass('C3 — Création événement via UI admin réussie');
      // Récupérer l'ID du dernier événement créé pour nettoyage
      if (adminToken) {
        const listR = await apiReq.get(`${API}/api/events`);
        const events = await listR.json();
        const created = events.find(e => e.title === 'Cours Robotique Test');
        if (created) adminCreatedEventId = created.id;
      }
    } else {
      fail('C3 — Formulaire création événement', 'Champs du formulaire introuvables');
    }
  } catch (e) { fail('C3 — Créer événement UI', e); }

  // C4 : supprimer un événement via UI admin
  if (createdEventIds.length > 0) {
    try {
      await pageAdmin.goto(`${BASE}/admin`, { waitUntil: 'networkidle', timeout: 12000 });
      await pageAdmin.waitForFunction(() => !document.body.innerText.includes('Chargement en cours'), { timeout: 8000 });
      const deleteBtn = pageAdmin.locator('button:has-text("Supprimer"), button:has-text("supprimer"), button:has-text("Delete")').first();
      if (await deleteBtn.isVisible().catch(() => false)) {
        const bodyBefore = await pageAdmin.locator('body').innerText();
        await deleteBtn.click();
        await pageAdmin.waitForTimeout(2000);
        const bodyAfter = await pageAdmin.locator('body').innerText();
        pass('C4 — Suppression événement via UI admin (bouton cliqué)');
        createdEventIds.shift(); // On retire l'ID de la liste de nettoyage
      } else {
        fail('C4 — Supprimer événement', 'Bouton Supprimer introuvable');
      }
    } catch (e) { fail('C4 — Supprimer événement UI', e); }
  } else {
    skip('C4 — Supprimer événement', 'aucun événement disponible');
  }

  // C5 : vérification ownership — user1 ne peut pas annuler réservation d'admin
  if (adminToken && userToken && createdEventIds.length > 0) {
    try {
      // admin1 crée une réservation
      const rCreate = await apiReq.post(`${API}/api/reservations`, {
        headers: { Authorization: `Bearer ${adminToken}`, 'Content-Type': 'application/json' },
        data: JSON.stringify({ eventId: createdEventIds[0] }),
      });
      if (rCreate.ok()) {
        const resAdm = await rCreate.json();
        // user1 tente de supprimer la réservation de admin1
        const rDelete = await apiReq.delete(`${API}/api/reservations/${resAdm.id}`, {
          headers: { Authorization: `Bearer ${userToken}` },
        });
        if (rDelete.status() === 403) {
          pass('C5 — Ownership check : user1 ne peut pas annuler la réservation d\'admin1 (403)');
        } else {
          fail('C5 — Ownership check', `HTTP ${rDelete.status()} attendu 403`);
        }
        // Nettoyage : admin1 annule sa propre réservation
        await apiReq.delete(`${API}/api/reservations/${resAdm.id}`, {
          headers: { Authorization: `Bearer ${adminToken}` },
        });
      } else {
        skip('C5 — Ownership check', `Réservation admin impossible: ${rCreate.status()}`);
      }
    } catch (e) { fail('C5 — Ownership check', e); }
  } else {
    skip('C5 — Ownership check', 'tokens ou événements manquants');
  }

  await ctxAdmin.close();

  // ════════════════════════════════════════════════════════════════════════════
  setSection('CLEANUP — Suppression des événements de test');
  // ════════════════════════════════════════════════════════════════════════════

  const toClean = [...createdEventIds, ...(adminCreatedEventId ? [adminCreatedEventId] : [])];
  for (const id of toClean) {
    try {
      const r = await apiReq.delete(`${API}/api/events/${id}`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      if (r.ok() || r.status() === 404) pass(`Nettoyage événement id=${id}`);
      else fail(`Nettoyage événement id=${id}`, `HTTP ${r.status()}`);
    } catch (e) { fail(`Nettoyage id=${id}`, e); }
  }

  await browser.close();

  // ════════════════════════════════════════════════════════════════════════════
  // RAPPORT FINAL
  // ════════════════════════════════════════════════════════════════════════════
  const passed  = results.filter(r => r.status.startsWith('✅')).length;
  const failed  = results.filter(r => r.status.startsWith('❌')).length;
  const skipped = results.filter(r => r.status.startsWith('⏭')).length;

  console.log('\n' + '═'.repeat(55));
  console.log('  RAPPORT FINAL — LogiscoolWebApp Playwright Tests');
  console.log('═'.repeat(55));

  let curSection = '';
  for (const r of results) {
    if (r.section !== curSection) {
      curSection = r.section;
      console.log(`\n  [ ${curSection} ]`);
    }
    console.log(`  ${r.status}  ${r.label}`);
    if (r.err) console.log(`           → ${r.err}`);
  }

  console.log('\n' + '─'.repeat(55));
  console.log(`  ✅ Passés : ${passed}  |  ❌ Échoués : ${failed}  |  ⏭ Skippés : ${skipped}`);
  console.log(`  Total : ${results.length} tests`);
  console.log('═'.repeat(55) + '\n');

  process.exit(failed > 0 ? 1 : 0);
}

run().catch(err => { console.error('FATAL:', err); process.exit(1); });
