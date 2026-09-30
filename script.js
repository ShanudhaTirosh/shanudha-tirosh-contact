/* Shanudha Tirosh — STX Enterprises Contact Card
   Runs 100% locally in browser. No tracking or telemetry. */
(function () {
  "use strict";

  /* =====================================================
     CONFIGURATION — Shanudha Tirosh Details
     ===================================================== */
  const contact = {
    firstName: "Shanudha",
    lastName: "Tirosh",
    phone: "+94755953683",
    whatsapp: "+94755953683",
    phoneDisplay: "+94 75 595 3683",
    email: "shanudhatirosh@gmail.com",
    website: "https://info.shanutechx.com",
    websiteDisplay: "info.shanutechx.com",
    organization: "STX Enterprises",
    title: "Founder",
    birthday: "2009-03-25",
    birthdayDisplay: "March 25, 2009",
    country: "Sri Lanka",
    note: "STX Enterprises | Contact saved from info.shanutechx.com",
    avatar: "assets/avatar.jpg"
  };

  const settings = {
    prefillMessage: "Hey Shanudha! I saved your contact card from STX Enterprises 👍",
    pageUrl: "",
    fileName: "Shanudha-Tirosh.vcf"
  };

  /* =====================================================
     Browser / Device Fingerprint Detection
     ===================================================== */
  function detectDevice() {
    const ua = navigator.userAgent || navigator.vendor || window.opera || "";
    const platform = navigator.platform || "";

    const isIOS = /iPad|iPhone|iPod/.test(ua) || (platform === "MacIntel" && navigator.maxTouchPoints > 1);
    const isAndroid = /Android/i.test(ua);
    const isMac = /Macintosh|MacIntel|MacPPC|Mac68K/.test(ua);
    const isWindows = /Win32|Win64|Windows|WinCE/.test(ua);

    let deviceType = "desktop";
    let label = "Save Contact (PC / Mac)";
    let subtext = "Downloads Shanudha-Tirosh.vcf to import into your Contacts app";
    let badgeText = "Desktop Browser";

    if (isIOS) {
      deviceType = "ios";
      label = "Open in Contacts App (iOS)";
      subtext = "Tap to open native iPhone Contacts sheet & save";
      badgeText = "iPhone / iOS Detected";
    } else if (isAndroid) {
      deviceType = "android";
      label = "Open in Contacts App (Android)";
      subtext = "Tap to open native Android Contacts app & import";
      badgeText = "Android Device Detected";
    } else if (isMac) {
      deviceType = "mac";
      label = "Save to Contacts (macOS)";
      subtext = "Downloads Shanudha-Tirosh.vcf for Apple Contacts";
      badgeText = "macOS Detected";
    } else if (isWindows) {
      deviceType = "windows";
      label = "Save to Contacts (Windows PC)";
      subtext = "Downloads Shanudha-Tirosh.vcf for Outlook or Google Contacts";
      badgeText = "Windows PC Detected";
    }

    return { isIOS, isAndroid, isMac, isWindows, isMobile: isIOS || isAndroid, deviceType, label, subtext, badgeText };
  }

  const device = detectDevice();

  /* =====================================================
     Helpers
     ===================================================== */
  const $ = (id) => document.getElementById(id);
  const digits = (s) => String(s || "").replace(/\D/g, "");
  const fullName = [contact.firstName, contact.lastName].filter(Boolean).join(" ");
  const pageUrl = settings.pageUrl || (location.origin !== "null" && location.origin ? location.origin + location.pathname : "https://info.shanutechx.com");

  let photoBase64Cache = null;

  async function fetchPhotoBase64() {
    if (photoBase64Cache) return photoBase64Cache;
    try {
      const res = await fetch(contact.avatar);
      if (!res.ok) return null;
      const blob = await res.blob();
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const resStr = reader.result || "";
          const parts = resStr.split(",");
          if (parts.length > 1) {
            photoBase64Cache = parts[1];
            resolve(photoBase64Cache);
          } else {
            resolve(null);
          }
        };
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(blob);
      });
    } catch (e) {
      return null;
    }
  }

  /* =====================================================
     vCard 3.0 Generator with Embedded Photo
     ===================================================== */
  const esc = (v) => String(v || "").replace(/\\/g, "\\\\").replace(/\r?\n/g, "\\n").replace(/;/g, "\\;").replace(/,/g, "\\,");

  function fold(line) {
    const enc = new TextEncoder();
    let out = "", cur = "", len = 0;
    for (const ch of line) {
      const n = enc.encode(ch).length;
      if (len + n > 74) { out += cur + "\r\n "; cur = ""; len = 1; }
      cur += ch; len += n;
    }
    return out + cur;
  }

  function buildVCard(photoB64) {
    const phone = "+" + digits(contact.phone);
    const wa = "+" + digits(contact.whatsapp);
    const lines = [
      "BEGIN:VCARD",
      "VERSION:3.0",
      `N:${esc(contact.lastName)};${esc(contact.firstName)};;;`,
      `FN:${esc(fullName)}`
    ];

    if (contact.organization) lines.push(`ORG:${esc(contact.organization)}`);
    if (contact.title) lines.push(`TITLE:${esc(contact.title)}`);
    if (digits(contact.phone)) lines.push(`TEL;TYPE=CELL,VOICE,pref:${phone}`);
    if (digits(contact.whatsapp) && wa !== phone) {
      lines.push(`item1.TEL;TYPE=CELL:${wa}`, "item1.X-ABLabel:WhatsApp");
    }
    if (contact.email) lines.push(`EMAIL;TYPE=INTERNET,pref:${esc(contact.email)}`);
    if (contact.website) lines.push(`URL:${contact.website}`);
    if (contact.birthday) lines.push(`BDAY:${contact.birthday}`);
    if (contact.country) lines.push(`ADR;TYPE=HOME:;;;;;;${esc(contact.country)}`);
    
    const note = [contact.note, digits(contact.whatsapp) ? "WhatsApp: " + wa : ""].filter(Boolean).join(" | ");
    if (note) lines.push(`NOTE:${esc(note)}`);

    if (photoB64) {
      lines.push(`PHOTO;TYPE=JPEG;ENCODING=b:${photoB64}`);
    }

    lines.push("END:VCARD");
    return lines.map(fold).join("\r\n") + "\r\n";
  }

  /* =====================================================
     Auto Direct Contacts App Saver (Android & iOS)
     ===================================================== */
  let blobUrl = null;

  async function openCard() {
    const photoB64 = await fetchPhotoBase64();
    const vcardStr = buildVCard(photoB64);
    
    const mimeType = (device.isAndroid || device.isIOS) ? "text/x-vcard;charset=utf-8" : "text/vcard;charset=utf-8";
    const blob = new Blob([vcardStr], { type: mimeType });
    
    if (blobUrl) URL.revokeObjectURL(blobUrl);
    blobUrl = URL.createObjectURL(blob);

    if (device.isIOS) {
      window.location.href = blobUrl;
    } else if (device.isAndroid) {
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = settings.fileName;
      a.setAttribute("type", "text/x-vcard");
      document.body.appendChild(a);
      a.click();

      try {
        window.location.href = blobUrl;
      } catch (_) {}

      setTimeout(() => { a.remove(); }, 1000);
    } else {
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = settings.fileName;
      a.rel = "noopener";
      document.body.appendChild(a);
      a.click();
      a.remove();
    }

    setTimeout(() => {
      if (blobUrl) { URL.revokeObjectURL(blobUrl); blobUrl = null; }
    }, 60000);
  }

  function successText() {
    if (device.isIOS) return "On your iPhone contact sheet, tap 'Add to Contacts' (top right), then 'Done'.";
    if (device.isAndroid) return "Tap the notification or 'Open' prompt to import directly into Android Contacts.";
    return `Downloaded as ${settings.fileName}. Open it to import into Apple Contacts, Outlook, or Google Contacts.`;
  }

  async function onSave() {
    const btn = $("save-btn"), label = $("save-label");
    const mBtn = $("mobile-save-btn"), mLabel = $("mobile-save-label");

    if (btn) btn.setAttribute("aria-busy", "true");
    if (mBtn) mBtn.setAttribute("aria-busy", "true");
    
    if (label) label.textContent = "Opening Contacts App…";
    if (mLabel) mLabel.textContent = "Opening Contacts App…";

    try {
      await openCard();
      $("success-text").textContent = successText();
      $("success").hidden = false;

      if (label) label.textContent = "Contacts App Opened!";
      if (mLabel) mLabel.textContent = "Contacts App Opened!";

      const dialog = $("contact-dialog");
      if (dialog && typeof dialog.showModal === "function") {
        dialog.showModal();
      }
    } catch (e) {
      $("success-text").textContent = "Error opening contact card. Please try again.";
      $("success").hidden = false;

      if (label) label.textContent = device.label;
      if (mLabel) mLabel.textContent = device.label;
    }

    if (btn) btn.removeAttribute("aria-busy");
    if (mBtn) mBtn.removeAttribute("aria-busy");

    setTimeout(() => {
      if (label) label.textContent = device.label;
      if (mLabel) mLabel.textContent = device.label;
    }, 4000);
  }

  /* =====================================================
     Clipboard & Sharing
     ===================================================== */
  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (e) {
      const t = document.createElement("textarea");
      t.value = text;
      t.setAttribute("readonly", "");
      t.style.cssText = "position:fixed;opacity:0;top:0;left:0";
      document.body.appendChild(t);
      t.select();
      let ok = false;
      try { ok = document.execCommand("copy"); } catch (_) {}
      t.remove();
      return ok;
    }
  }

  function flash(btn, textId, msg, original) {
    const el = $(textId);
    if (!el) return;
    const prev = original || el.textContent;
    el.textContent = msg;
    if (btn) btn.classList.add("done");
    setTimeout(() => {
      el.textContent = prev;
      if (btn) btn.classList.remove("done");
    }, 2000);
  }

  async function onCopyPhone() {
    const ok = await copyText(contact.phoneDisplay || contact.phone);
    flash($("copy-btn"), "copy-label", ok ? "Copied!" : "Copy", "Copy");
  }

  async function onCopyEmail() {
    const ok = await copyText(contact.email);
    flash($("copy-email-btn"), "copy-email-label", ok ? "Copied!" : "Copy", "Copy");
  }

  async function onCopyAll() {
    const textBlock = [
      `Name: ${fullName}`,
      `Organization: ${contact.organization}`,
      `Phone: ${contact.phoneDisplay}`,
      `Email: ${contact.email}`,
      `Website: ${contact.website}`,
      `Birthday: ${contact.birthdayDisplay}`,
      `Country: ${contact.country}`
    ].join("\n");

    const ok = await copyText(textBlock);
    const btn = $("copy-all-btn");
    const orig = btn.innerHTML;
    btn.textContent = ok ? "Copied All!" : "Failed to Copy";
    setTimeout(() => { btn.innerHTML = orig; }, 2000);
  }

  async function onSharePage() {
    const data = {
      title: `${fullName} — STX Enterprises`,
      text: `Save ${fullName}'s contact card or message on WhatsApp:`,
      url: pageUrl
    };
    if (navigator.share) {
      try { await navigator.share(data); return; }
      catch (e) { if (e && e.name === "AbortError") return; }
    }
    const ok = await copyText(pageUrl);
    const btn = $("share-btn");
    const orig = btn.innerHTML;
    btn.textContent = ok ? "Link Copied!" : "Failed";
    setTimeout(() => { btn.innerHTML = orig; }, 2000);
  }

  function onWhatsAppShare() {
    const message = encodeURIComponent(`Save ${fullName}'s official contact card: ${pageUrl}`);
    const waUrl = `https://api.whatsapp.com/send?text=${message}`;
    window.open(waUrl, "_blank", "noopener,noreferrer");
  }

  /* =====================================================
     Render & HowTo Tabs
     ===================================================== */
  function waLink(web) {
    const n = digits(contact.whatsapp);
    const msg = settings.prefillMessage ? encodeURIComponent(settings.prefillMessage) : "";
    if (web) return `https://web.whatsapp.com/send?phone=${n}` + (msg ? `&text=${msg}` : "");
    return `https://wa.me/${n}` + (msg ? `?text=${msg}` : "");
  }

  const stepsData = {
    auto: device.isIOS ? [
      "Tap <b>Open in Contacts App (iOS)</b> above.",
      "iPhone opens native contact sheet preview.",
      "Tap <b>Add to Contacts</b> and press <b>Done</b>."
    ] : device.isAndroid ? [
      "Tap <b>Open in Contacts App (Android)</b> above.",
      "Your phone launches native Contacts import prompt.",
      "Tap <b>Save / Import</b> to add to Google Contacts."
    ] : [
      "Click <b>Save Contact</b> to download <code>Shanudha-Tirosh.vcf</code>.",
      "Open the file to import into Outlook, Apple Contacts, or Google Contacts.",
      "Or scan the QR code with your smartphone camera."
    ],
    ios: [
      "Tap <b>Open in Contacts App (iOS)</b>.",
      "Safari opens the native iOS contact sheet.",
      "Tap <b>Save / Add to Contacts</b> top right."
    ],
    android: [
      "Tap <b>Open in Contacts App (Android)</b>.",
      "Your phone opens the <b>Shanudha-Tirosh.vcf</b> import prompt.",
      "Select Google Contacts and tap <b>Import / Save</b>."
    ]
  };

  function renderHowTo(tabKey) {
    const list = $("howto-list");
    if (!list) return;
    const items = stepsData[tabKey] || stepsData.auto;
    list.innerHTML = items.map((step) => `<li>${step}</li>`).join("");
  }

  function renderQR() {
    const box = $("qr");
    if (!box) return;
    $("qr-url").textContent = contact.websiteDisplay;
    if (typeof qrcode !== "function") {
      box.hidden = true;
      return;
    }
    box.innerHTML = "";
    const qr = qrcode(0, "M");
    qr.addData(pageUrl);
    qr.make();
    box.innerHTML = qr.createSvgTag({ cellSize: 4, margin: 0, scalable: true });
    const svg = box.querySelector("svg");
    if (svg) {
      svg.setAttribute("aria-hidden", "true");
      svg.setAttribute("shape-rendering", "crispEdges");
    }
  }

  function init() {
    document.title = `Save ${fullName}'s Contact | STX Enterprises`;

    if ($("device-name")) $("device-name").textContent = device.badgeText;
    if ($("save-label")) $("save-label").textContent = device.label;
    if ($("save-subtext")) $("save-subtext").textContent = device.subtext;
    if ($("mobile-save-label")) $("mobile-save-label").textContent = device.label;

    document.querySelectorAll('[data-bind="fullName"]').forEach((el) => (el.textContent = fullName));
    
    if ($("number")) {
      $("number").textContent = contact.phoneDisplay;
      $("number").href = "tel:+" + digits(contact.phone);
    }
    if ($("email-link")) {
      $("email-link").textContent = contact.email;
      $("email-link").href = "mailto:" + contact.email;
    }
    if ($("web-link")) {
      $("web-link").href = contact.website;
    }
    if ($("bday-val")) {
      $("bday-val").textContent = contact.birthdayDisplay;
    }
    if ($("org-val")) {
      $("org-val").textContent = `${contact.organization} • ${contact.country}`;
    }

    if ($("call-btn")) $("call-btn").href = "tel:+" + digits(contact.phone);
    if ($("wa-btn")) $("wa-btn").href = waLink(false);
    if ($("wa-web-btn")) $("wa-web-btn").href = waLink(true);
    if ($("mail-btn")) $("mail-btn").href = "mailto:" + contact.email;

    fetchPhotoBase64();

    if ($("save-btn")) $("save-btn").addEventListener("click", onSave);
    if ($("mobile-save-btn")) $("mobile-save-btn").addEventListener("click", onSave);
    if ($("again-btn")) $("again-btn").addEventListener("click", onSave);
    if ($("copy-btn")) $("copy-btn").addEventListener("click", onCopyPhone);
    if ($("copy-email-btn")) $("copy-email-btn").addEventListener("click", onCopyEmail);
    if ($("copy-all-btn")) $("copy-all-btn").addEventListener("click", onCopyAll);
    if ($("share-btn")) $("share-btn").addEventListener("click", onSharePage);
    if ($("wa-share-btn")) $("wa-share-btn").addEventListener("click", onWhatsAppShare);

    if ($("close-dialog")) {
      $("close-dialog").addEventListener("click", () => {
        const dialog = $("contact-dialog");
        if (dialog && typeof dialog.close === "function") dialog.close();
      });
    }
    if ($("confirm-dialog-btn")) {
      $("confirm-dialog-btn").addEventListener("click", () => {
        const dialog = $("contact-dialog");
        if (dialog && typeof dialog.close === "function") dialog.close();
      });
    }

    document.querySelectorAll('.tab-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.tab-btn').forEach((b) => b.classList.remove('active'));
        e.target.classList.add('active');
        const tab = e.target.getAttribute('data-tab');
        renderHowTo(tab);
      });
    });

    renderHowTo('auto');
    renderQR();
  }

  window.__contactCard = { buildVCard, contact, settings, device, fetchPhotoBase64 };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
