// ==UserScript==
// @name         Expert Editor Universal TinyMCE
// @namespace    https://github.com/Steven17200
// @version      3.2
// @description  Barre d'outils complète : Zoom, Couleurs (NRBV), Manuscrit, YT & SoundCloud Minimaliste
// @author       Steven17200
// @icon         https://cdn-icons-png.flaticon.com/512/825/825590.png
// @icon         https://www.universfreebox.com/favicon.ico
// @match        *://*/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // --- 1. CSS ---
    const style = document.createElement('style');
    style.innerHTML = `
        .mce-btn-custom button { border-radius: 4px !important; border: none !important; margin-left: 2px; transition: transform 0.1s, opacity 0.2s; padding: 2px 6px !important; min-width: 28px; height: 24px; }
        .mce-btn-custom span { color: #fff !important; font-weight: bold !important; font-size: 11px; line-height: 20px; }
        .mce-btn-custom:hover { opacity: 0.8; transform: scale(1.05); }
        #btn-font-sw button { background: #000 !important; border: 1px solid #ffe81f !important; }
        #btn-font-tr button { background: #5d1010 !important; }
        #btn-font-t8 button { background: #222 !important; border-left: 3px solid #ff0000 !important; }
        #btn-zoom-fixed button { background: #7f8c8d !important; }
        #btn-text-micro button { background: #444 !important; }
        #btn-human-font button { background: #9b59b6 !important; }
        #btn-video-yt button   { background: #ff0000 !important; }
        #btn-sc-custom button  { background: #ff5500 !important; }
        #btn-list-num button, #btn-list-dots button, #btn-table-custom button { background: #555 !important; }
        #btn-text-black button { background: #2c3e50 !important; }
        #btn-text-red button   { background: #e74c3c !important; }
        #btn-text-blue button  { background: #3498db !important; }
        #btn-text-green button { background: #27ae60 !important; }
        #btn-text-orange button { background: #ff9800 !important; }
        #btn-text-white button { background: #ffffff !important; border: 1px solid #ccc !important; }
        #btn-text-white span   { color: #000 !important; }
    `;
    document.head.appendChild(style);

    function getEditor() { return window.tinyMCE ? window.tinyMCE.activeEditor : null; }

    let sizeLevel = 0;
    const fontSizes = ['14px', '18px', '24px', '30px', '36px'];
    const labels = ['A', 'A+', 'A++', 'A+++', 'MAX'];

    // --- 2. FONCTION MÉDIA AMÉLIORÉE (Boucle + Son) ---
    function insertMedia(type) {
        const ed = getEditor();
        if (!ed) return;
        const url = prompt(type === 'yt' ? "Lien YouTube ou Dailymotion :" : "Lien SoundCloud :");
        if (!url) return;

        let html = "";
        if (type === 'yt') {
            let width = prompt("Largeur de la vidéo (px) :", "560");
            let height = Math.round((width * 315) / 560);

            const ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:.*v=|.*\/|.*embed\/))([^"&?\/\s]{11})/);
            const dmMatch = url.match(/(?:dailymotion\.com\/(?:video|embed\/video)\/|dai\.ly\/)([a-zA-Z0-9]+)/);

            if (ytMatch) {
                const id = ytMatch[1];
                // loop=1 + playlist=ID (obligatoire pour boucler sur YT) + autoplay=1
                html = `<p><iframe width="${width}" height="${height}" src="https://www.youtube.com/embed/${id}?autoplay=1&loop=1&playlist=${id}&mute=0" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe></p>`;
            } else if (dmMatch) {
                const id = dmMatch[1];
                // loop=1 + mute=0 pour Dailymotion
                html = `<p><iframe width="${width}" height="${height}" src="https://www.dailymotion.com/embed/video/${id}?autoplay=1&loop=1&mute=0" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe></p>`;
            } else {
                alert("Lien non reconnu");
            }
        } else {
            const cleanUrl = encodeURIComponent(url.split('?')[0]);
            html = `<p><iframe width="100%" height="20" scrolling="no" frameborder="no" src="https://w.soundcloud.com/player/?url=${cleanUrl}&color=%23ff5500&inverse=false&auto_play=false"></iframe></p>`;
        }
        if (html) ed.execCommand('mceInsertContent', false, html);
    }

    function inject() {
        const ed = getEditor();
        if (!ed) return;
        const toolbar = document.querySelector('.mce-container-body.mce-flow-layout .mce-container-body.mce-flow-layout') ||
                        document.querySelector('.mce-container-body.mce-flow-layout');

        if (toolbar && !document.getElementById('btn-zoom-fixed')) {
            const create = (id, label, f, title = "") => {
                const d = document.createElement('div');
                d.id = id; d.className = 'mce-widget mce-btn mce-btn-custom';
                d.setAttribute('title', title);
                d.innerHTML = `<button type="button"><span>${label}</span></button>`;
                d.addEventListener('mousedown', (e) => { e.preventDefault(); f(e); });
                return d;
            };

            toolbar.appendChild(create('btn-list-num', '1.', () => ed.execCommand('InsertOrderedList')));
            toolbar.appendChild(create('btn-list-dots', '•', () => ed.execCommand('InsertUnorderedList')));
            toolbar.appendChild(create('btn-table-custom', '田', () => ed.execCommand('mceInsertContent', false, '<table style="border-collapse:collapse;width:100%;border:1px solid black;"><tr><td style="border:1px solid black;padding:8px;">&nbsp;</td></tr></table>')));
            toolbar.appendChild(create('btn-video-yt', 'YT', () => insertMedia('yt'), "YouTube / Dailymotion (Boucle + Son)"));
            toolbar.appendChild(create('btn-sc-custom', 'SC', () => insertMedia('sc'), "SoundCloud"));
            toolbar.appendChild(create('btn-zoom-fixed', 'A', (e) => {
                sizeLevel = (sizeLevel + 1) % fontSizes.length;
                ed.execCommand('FontSize', false, fontSizes[sizeLevel]);
                e.currentTarget.querySelector('span').innerText = labels[sizeLevel];
            }, "Zoom"));
            toolbar.appendChild(create('btn-text-micro', '6', () => {
                const sel = ed.selection.getContent();
                if (sel) ed.execCommand('mceInsertContent', false, `<span style="font-size:9px;">${sel}</span>`);
            }, "Micro"));
            toolbar.appendChild(create('btn-human-font', '✎', () => {
                const sel = ed.selection.getContent();
                if (sel) ed.execCommand('mceInsertContent', false, `<span style="font-family:'Comic Sans MS',cursive;font-size:1.1em;">${sel}</span>`);
            }, "Manuscrit"));
            toolbar.appendChild(create('btn-font-sw', 'SW', () => {
                const sel = ed.selection.getContent();
                if (sel) ed.execCommand('mceInsertContent', false, `<span style="color:#ffe81f; background:#000; font-family:'Arial Black'; letter-spacing:2px; padding:0 5px;">${sel}</span>`);
            }));
            toolbar.appendChild(create('btn-font-tr', 'TR', () => {
                const sel = ed.selection.getContent();
                if (sel) ed.execCommand('mceInsertContent', false, `<span style="color:#ff4500; font-family:Impact; text-transform:uppercase; font-style:italic;">${sel}</span>`);
            }));
            toolbar.appendChild(create('btn-font-t8', 'T8', () => {
                const sel = ed.selection.getContent();
                if (sel) ed.execCommand('mceInsertContent', false, `<span style="color:#ff0000; font-family:monospace; font-weight:bold; text-shadow:0 0 5px red;">${sel}</span>`);
            }));
            toolbar.appendChild(create('btn-text-black', 'N', () => ed.execCommand('ForeColor', false, '#000000')));
            toolbar.appendChild(create('btn-text-red', 'R', () => ed.execCommand('ForeColor', false, '#e74c3c')));
            toolbar.appendChild(create('btn-text-blue', 'B', () => ed.execCommand('ForeColor', false, '#3498db')));
            toolbar.appendChild(create('btn-text-green', 'V', () => ed.execCommand('ForeColor', false, '#27ae60')));
            toolbar.appendChild(create('btn-text-orange', 'O', () => ed.execCommand('ForeColor', false, '#ff9800')));
            toolbar.appendChild(create('btn-text-white', 'Bl', () => ed.execCommand('ForeColor', false, '#ffffff')));
        }
    }

    setInterval(inject, 2000);
})();
