#!/usr/bin/env node

// Génère 3 audios ElevenLabs et les place dans assets/audio/
// Usage: node generate-audios.cjs

const fs = require('fs');
const path = require('path');
const https = require('https');

const API_KEY = process.env.ELEVEN_API_KEY || 'sk_081d6e2a22f9c9574c1b49ee47a0c92bbf255f81282a940d';
const VOICE_ID = '21m00Tcm4TlvDq8ikWAM';
const MODEL_ID = 'eleven_multilingual_v2';

const testimonials = [
  {
    name: 'Marc Durand',
    filename: 'marc-durand-testimonial.mp3',
    text: "Avant Solaire Facile, je passais 15 heures par semaine juste sur l'administratif! Les dossiers Consuel, Enedis, les relances incessantes... Un cauchemar! Depuis 3 mois, c'est magique! 15 heures réduites à 2 heures. Les délais Consuel ont diminué de 40%. Mes clients reçoivent leur attestation plus vite. C'est un gain de temps énorme. Je peux maintenant me concentrer sur ce que j'aime: installer du solaire et vendre! Solaire Facile, c'est mon partenaire idéal!"
  },
  {
    name: 'Sophie Leclerc',
    filename: 'sophie-leclerc-testimonial.mp3',
    text: "J'étais sceptique au départ, honnêtement! Faire appel à un prestataire pour la paperasse? Je ne savais pas si je pouvais avoir confiance. Mais l'équipe Solaire Facile m'a rassurée dès le départ. Maintenant? 3 mois après, c'est un succès fou! Mes dossiers Enedis passent sans aucun problème. Zéro rejet. Zéro complément. Mes clients sont ultra satisfaits. Et moi, j'ai gagné du temps pour développer mon activité. C'est un investissement qui vaut VRAIMENT chaque euro! Je recommande à 100%!"
  },
  {
    name: 'Thomas Martin',
    filename: 'thomas-martin-testimonial.mp3',
    text: "Le plus de Solaire Facile? C'est l'accompagnement humain! Ce n'est pas juste un service impersonnel, c'est un vrai partenaire! Ils gèrent VRAIMENT tout. Consuel? Fait. Enedis? Fait. DP mairie? Fait. Pas de surprise, pas de délai pris. Juste du professionnel! Avant, j'étais stressé à chaque dossier. Maintenant, je suis serein. J'ai pu me concentrer sur ce que je fais de mieux: installer du solaire! Et faire croître mon business! Merci Solaire Facile!"
  }
];

const audioDir = path.join(__dirname, 'assets', 'audio');
if (!fs.existsSync(audioDir)) fs.mkdirSync(audioDir, { recursive: true });

function generate(text, filename) {
  return new Promise((resolve) => {
    console.log(`🎙️  Génération: ${filename}...`);
    const postData = JSON.stringify({
      text,
      model_id: MODEL_ID,
      voice_settings: { stability: 0.5, similarity_boost: 0.75 }
    });
    const options = {
      hostname: 'api.elevenlabs.io',
      port: 443,
      path: `/v1/text-to-speech/${VOICE_ID}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        'xi-api-key': API_KEY,
      }
    };

    const req = https.request(options, res => {
      let data = Buffer.alloc(0);
      res.on('data', chunk => data = Buffer.concat([data, chunk]));
      res.on('end', () => {
        if (res.statusCode === 200) {
          fs.writeFileSync(path.join(audioDir, filename), data);
          console.log(`   ✅ ${filename} (${(data.length/1024).toFixed(2)} KB)\n`);
          resolve(true);
        } else {
          console.log(`   ❌ Erreur ${res.statusCode}: ${data.toString()}\n`);
          resolve(false);
        }
      });
    });
    req.on('error', err => { console.error(err); resolve(false); });
    req.write(postData);
    req.end();
  });
}

(async () => {
  let ok = 0;
  for (const t of testimonials) {
    const r = await generate(t.text, t.filename);
    if (r) ok++;
  }
  console.log(`
Résultat: ${ok}/${testimonials.length} générés.`);
})();
