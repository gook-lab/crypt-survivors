// Bulk-pull PixelLab cloud objects (review-promoted variants) into
// src/assets/pixellab_candidates/<concept>/<uuid8>.png.
//
// Why a script instead of MCP calls: MCP get_object returns full metadata
// per call and would burn ~269 tool invocations + context for what is
// fundamentally a file-fetch. The PixelLab cloud serves rotation PNGs from
// a deterministic Backblaze CDN URL — no auth needed, no signature — so a
// flat curl/fetch loop is dramatically faster and cheaper.
//
// URL pattern (verified on 3 sample objects):
//   https://backblaze.pixellab.ai/file/pixellab-characters/objects/
//     <OWNER_UUID>/<OBJECT_UUID>/rotations/unknown.png
//
// Concurrency: 12 parallel fetches keeps us under any rate limits without
// hammering the CDN. Each PNG is ~1-5KB, total ~1-2MB across 269 files.

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const DEST_BASE = path.join(ROOT, 'src/assets/pixellab_candidates');
const OWNER_UUID = '9c338ce6-1b8f-4f3e-a302-31dde0bad543';
const CONCURRENCY = 12;

// (concept_slug, uuid) pairs for the 269 untagged completed objects.
// Concept slugs match the existing src/assets/{projectiles_vs,fx_vs,pickups_vs}
// folder naming so downstream wiring is straightforward.
const TARGETS = [
  // ── level_up_sparkle (8 untagged variants) ────────────────────────────
  ['level_up_sparkle', '3522fb13-fe59-4a69-b749-03ed90d8338d'],
  ['level_up_sparkle', '607f043e-beae-48b7-a168-20ca45f469ad'],
  ['level_up_sparkle', '6ea2e5ce-785b-4032-b975-1d7d15ad6a32'],
  ['level_up_sparkle', 'cc953643-4e3c-4ef9-b170-bf3b0b44af2d'],
  ['level_up_sparkle', '29c448f5-72de-4f9c-ae0a-23680fc215ad'],
  ['level_up_sparkle', '9acc6f9f-9af3-4d4a-9dbd-9027aa732aea'],
  ['level_up_sparkle', '814edfce-c998-4f56-8377-82ac48391423'],
  ['level_up_sparkle', '5cf332b3-958c-47ca-b215-5b8d25e36d58'],

  // ── sword_slash (8) ───────────────────────────────────────────────────
  ['sword_slash', '333417b4-f1c4-4f4e-a656-541bfbba216e'],
  ['sword_slash', '1a154e57-2087-44a8-b174-8917718e398c'],
  ['sword_slash', '63bcc3f1-6822-40e8-86bf-d1bb6051c6ff'],
  ['sword_slash', '1236abd6-a32f-46a6-8f36-e5ba0ef98d2c'],
  ['sword_slash', '756cd9d7-0699-453f-8c9c-528b504ae5e2'],
  ['sword_slash', '1ac25c1e-1154-472d-8cf4-ec75f1d4641d'],
  ['sword_slash', 'c5149a62-c651-4266-9660-d1ef09317324'],
  ['sword_slash', '88a2c9de-cbab-4020-8c59-b16ef9e8cec8'],

  // ── fire_explosion (8) ────────────────────────────────────────────────
  ['fire_explosion', 'f3eeddab-d0a4-425e-9189-4aed330d01fb'],
  ['fire_explosion', '66b9022e-3c3e-4e3b-8b0f-367b86abb462'],
  ['fire_explosion', 'ed2a8cd5-4358-4e2e-8d93-03109d02d027'],
  ['fire_explosion', '03bff97b-fb43-4c0d-9932-d8b9dae71725'],
  ['fire_explosion', '9fdc5ae3-3cdc-4adf-a978-cc6c61d199d7'],
  ['fire_explosion', '2c745590-f11f-42fc-8b34-752c1a55f8de'],
  ['fire_explosion', '8e463c78-b2c6-44fa-9682-e7f5f8671084'],
  ['fire_explosion', '7afa588f-9dda-4f04-8a17-2fd81724a7df'],

  // ── starfield (8) ─────────────────────────────────────────────────────
  ['starfield', '3f50c9ba-4f09-409f-a971-fc8c3118c252'],
  ['starfield', '60dd0158-edba-44b0-be9e-fdb807b2c374'],
  ['starfield', 'b101c59d-a3f3-4d81-bd54-c7f016e4f0ca'],
  ['starfield', '6fdc25b7-e8c9-48c7-9560-7ba6e0edac1b'],
  ['starfield', 'd127ee12-0231-4d09-9ca0-e3cc285b4ea9'],
  ['starfield', '24102140-d518-4728-b025-595098e7177f'],
  ['starfield', 'b299d07e-c734-49ed-86ab-2e893dfc2d53'],
  ['starfield', '4e640c4e-578a-499e-9b73-747a86add481'],

  // ── nova_orb (16) ─────────────────────────────────────────────────────
  ['nova_orb', '0db9d2f4-47ee-4d98-b125-38d42374e70b'],
  ['nova_orb', 'f38821bb-06f5-437a-a51e-15f8be2f9dce'],
  ['nova_orb', 'c1daf845-b5d8-416f-b3c4-a30ced6cc886'],
  ['nova_orb', '6da59280-fbe2-49c4-8c63-0f2a478dcd96'],
  ['nova_orb', '8d0541cc-1877-4d4d-a491-a605d566c2fc'],
  ['nova_orb', '4a3bb102-c012-498a-b370-ed678ba07ca8'],
  ['nova_orb', 'b1db5066-07ba-4718-a256-7017c3c03c3f'],
  ['nova_orb', '60da42f1-8012-4202-8005-53d0736bee83'],
  ['nova_orb', 'e6804068-e7c7-48fe-882f-230dde04a3ae'],
  ['nova_orb', '14861bb7-2738-43d1-8b3e-fe687f21128f'],
  ['nova_orb', '7dbb4d14-a5b2-49be-9d11-54f98d448fcd'],
  ['nova_orb', '141c7321-6d71-4106-8f1d-0d37c648d68d'],
  ['nova_orb', '72dec4e4-efc8-4975-9bf7-a6267abcb6a7'],
  ['nova_orb', 'c042eb62-b1a7-44b6-8f15-f8ba1c662db9'],
  ['nova_orb', 'aa2dacc6-2dfe-4d1d-869b-d90989fbc461'],

  // ── chest_gold (12) — dedupe handled by Set below ─────────────────────
  ['chest_gold', '2e991496-9548-43b4-8077-1c45d7770af6'],
  ['chest_gold', 'a8f24a56-7369-43db-93d7-0b56c108187f'],
  ['chest_gold', 'be25ceb5-a6a8-4498-884f-d1f4eda6b557'],
  ['chest_gold', 'd45c614b-a361-4f31-9af0-57a67e2b51ef'],
  ['chest_gold', 'fef44141-a33f-4e7a-8bbd-82cd42471cea'],
  ['chest_gold', '4b77c73c-f691-49b6-b57c-64208112efcb'],
  ['chest_gold', 'f2e0adef-373a-4fc7-888f-a4697cef3c42'],
  ['chest_gold', '721efe2e-5cb8-4923-9b0c-383185455d02'],
  ['chest_gold', '18da9724-bd03-45b2-8857-970831410bb4'],
  ['chest_gold', '28900040-31d6-4788-bdf7-36a0394fc654'],
  ['chest_gold', 'e1ecefbb-5af0-44df-aa97-282a1a1f949d'],
  ['chest_gold', '505268eb-60cb-47f5-bafb-0193ecaebba4'],
  ['chest_gold', 'c3585948-596f-49e0-aadf-7ed939f55a51'],

  // ── potion_might (15) ─────────────────────────────────────────────────
  ['potion_might', '04aa6d79-9673-4b02-9f7b-36265bfb4247'],
  ['potion_might', 'e92a1711-ad37-4934-ae68-05a7ad2d08c2'],
  ['potion_might', 'e6b1bbaf-fd58-4605-8520-c0f1b44e3f55'],
  ['potion_might', '8df730bb-41d3-443b-870c-e7eb54a3e189'],
  ['potion_might', 'f97646e7-66d2-40b2-84b1-b78e3cd56fc3'],
  ['potion_might', 'ca8be860-6cc3-48c9-9627-295c06d8458c'],
  ['potion_might', '9d44a7ae-4ee9-499e-bbc1-d39ea0bb2fb8'],
  ['potion_might', 'f3de5ef6-a65e-42c3-82a4-f2cb2401b149'],
  ['potion_might', 'e4e27d81-bf72-4161-bbcd-d3d031daf8fd'],
  ['potion_might', '83193293-ef34-4017-ad46-be9d59f6eefd'],
  ['potion_might', '18b23389-8021-4106-8cff-2fae655fa703'],
  ['potion_might', 'cd5c4d1a-ee7a-4410-ba89-eb072666eadf'],
  ['potion_might', 'cae772e3-8c3c-40d0-a822-f7965dd3d0be'],
  ['potion_might', '80689a1d-08e0-4527-a2b0-46093310e579'],
  ['potion_might', 'c152426a-8cf4-493d-9efa-68703b148dcb'],

  // ── wide_slash (8) ────────────────────────────────────────────────────
  ['wide_slash', 'a0f3c1f5-5b22-447e-bf67-906bae94d4ce'],
  ['wide_slash', '9885de9d-faf4-41e5-a460-04a7f8021b15'],
  ['wide_slash', 'faf160bd-4af8-4527-9d69-b04004af1437'],
  ['wide_slash', 'eef3260c-c225-4541-bd39-c07438bb34a2'],
  ['wide_slash', 'f71ffae8-0223-4c60-9a4a-30037f0583c2'],
  ['wide_slash', '858debe1-106e-4ff5-910e-6c338bf2639f'],
  ['wide_slash', '7461a24d-7f58-46fe-9cbf-98fb776bfc36'],
  ['wide_slash', '50620eba-bc43-43d9-b9f2-c6e191fb7c80'],

  // ── holywater (15) ────────────────────────────────────────────────────
  ['holywater', 'e5ee41c2-f242-4952-a47e-153100e81522'],
  ['holywater', '7db31f09-cad3-4620-bae7-9e52967500e6'],
  ['holywater', 'ffeffd70-2b8c-4b32-8f3e-5db5a6ea1b8b'],
  ['holywater', 'f3558b30-0504-454d-b9d9-e84fe60e0a0f'],
  ['holywater', 'db13919a-7163-4490-9e4f-e222508536be'],
  ['holywater', '33e09b2e-a5db-4826-bd70-0211e1ffe1eb'],
  ['holywater', '544f6573-f549-44c4-a971-8db3d235b897'],
  ['holywater', '3ee020e7-696a-45da-8c89-cdafb54d8e68'],
  ['holywater', '2d2c1050-1d8a-4d77-a2d5-4d2bd5a2b3de'],
  ['holywater', '1ce49929-7d08-4414-845e-d7dfe9db14d1'],
  ['holywater', 'ca6e8fc8-06a3-4ece-822f-05882834753e'],
  ['holywater', '7eecc823-85f5-4047-93b4-0e287c07ff01'],
  ['holywater', 'd75f474f-35a7-4a1d-9925-efb31d70b18e'],
  ['holywater', 'f329c380-2a00-4a14-a48a-7a425669fc2a'],
  ['holywater', 'ccc55595-ba8b-4921-b2ca-802e55e05d4a'],

  // ── firewall (15) ─────────────────────────────────────────────────────
  ['firewall', 'c1013c47-6389-40d9-966f-14bac448f79d'],
  ['firewall', '4069fc9f-5277-4a3e-913a-dba53f87d98f'],
  ['firewall', '38f29b18-e164-4830-bb46-418a04c91884'],
  ['firewall', '4deb57a2-4606-463d-87ff-6e0ef9568685'],
  ['firewall', 'ff5abcc1-9f37-4aab-9c3a-72d211a2e12c'],
  ['firewall', '37df1a5f-271d-4fb6-ba2f-cd9cb17aa131'],
  ['firewall', 'cc6d1b0a-f31c-4fc4-9fce-a1b8954cfbd4'],
  ['firewall', 'f74ed4c6-bf0a-4342-8736-b17ea9b57c98'],
  ['firewall', '342e1f34-b506-486b-b362-8daab1a628f4'],
  ['firewall', 'ac3bda4e-680e-44fa-a586-6e7f32c4a665'],
  ['firewall', '53a22d0e-640d-478b-801f-64b682b7800e'],
  ['firewall', '2cba52c1-c64c-4eea-a2f7-f1dc7b89d9a7'],
  ['firewall', '64c34989-b3a1-4438-a927-c496acd594b9'],
  ['firewall', '7925a6aa-bdef-41bd-bc11-f01b8b386ccc'],
  ['firewall', '97b87b94-bb97-4690-b167-723380117909'],

  // ── arrow (50) ────────────────────────────────────────────────────────
  ['arrow', '6c08e2ce-3d17-4b52-b036-246d72b8aa5b'],
  ['arrow', '637df037-7568-4abd-b250-72cc94b354ea'],
  ['arrow', '9e382d8d-cb40-4e95-b2d6-8dfaba467d18'],
  ['arrow', '2f89b577-f6b8-4a72-b3f7-45d59244ba76'],
  ['arrow', 'f71b4978-5ba3-48be-be6f-274154c76428'],
  ['arrow', 'df1f1c97-fe8b-45d8-9725-de0da61c5644'],
  ['arrow', '52638b75-6fa1-42c9-b424-1eeeb3d5fbf8'],
  ['arrow', 'ed2782b6-18d4-43f5-9592-86ea9b9ce9d8'],
  ['arrow', '67b2c15b-1677-42f6-8e5c-34b65cfb4460'],
  ['arrow', '32c3910b-4836-4a0e-bfd3-d18d61481517'],
  ['arrow', '22121490-4929-4741-a481-482675407287'],
  ['arrow', '878dc86f-f79e-4717-bcca-a752dd0ff267'],
  ['arrow', '2d01ac6b-f3e5-4db7-aeef-18042ae69b52'],
  ['arrow', '178ef16a-625c-4949-86db-7623deeaaa34'],
  ['arrow', 'c1ba526a-7c4d-452d-a379-d564684e1486'],
  ['arrow', 'b5fd5d88-6094-4ecc-8159-9327bf9ff69a'],
  ['arrow', '2b2e4dfa-42d4-4928-b759-7251f2f0a6de'],
  ['arrow', 'a9fe1aed-4db8-4289-89cc-a5369fc5110e'],
  ['arrow', '78e64c8d-5f63-429a-9d26-eac7ef04b4d7'],
  ['arrow', '83298f65-af2c-4dfd-b23b-a79e4105e9c8'],
  ['arrow', '0aa604bd-ccc1-4b60-a847-0f39b26c1998'],
  ['arrow', '36cbdb86-e2bc-467f-bbd4-ad81073f9c26'],
  ['arrow', '635f960e-aab0-4955-817d-409bfa2b96ab'],
  ['arrow', '9709b6a7-e3ff-4aa6-a810-7fc62573af38'],
  ['arrow', 'ee29a6e5-27e4-4904-828b-f86db2e7ed76'],
  ['arrow', 'a1799910-3859-41e0-bf8b-3049b2dea583'],
  ['arrow', '9d3d0165-fc1a-48d1-a5cc-e91bb9d33248'],
  ['arrow', 'fc51e52a-e70b-43e0-8d4b-22736e650de8'],
  ['arrow', 'f7dd9b67-04b9-45e3-87b4-46b3e220a764'],
  ['arrow', 'dda94ee9-d1e5-40a7-8e8e-9cf616184310'],
  ['arrow', 'cf8d1466-7eae-4750-8d50-31fb2b53cdbe'],
  ['arrow', '88c2cd99-6801-4067-84fe-79c2d9c84e07'],
  ['arrow', '69d803a6-5753-4911-8f87-565c33a859f1'],
  ['arrow', 'e274b6c2-a897-4d4f-af68-803a295fe53c'],
  ['arrow', '49141749-ae5d-4d99-ab4b-e92d3021e218'],
  ['arrow', '2157805f-12d0-46f6-acb2-a6bc4368c0bc'],
  ['arrow', 'e730c29b-54e5-4614-958e-3c4c2f9cfe7b'],
  ['arrow', '8dedb965-24e6-4643-bc65-9cab7756b093'],
  ['arrow', 'f2eae669-d85b-467f-86ac-e0650f2fbe29'],
  ['arrow', 'b651c73c-60fa-473f-961c-09eb1e4641d1'],
  ['arrow', 'c66a86b1-45cd-4359-8279-41c0c019ffe5'],
  ['arrow', '28edd866-be9f-410b-8f0f-d77d0bc28ac5'],
  ['arrow', '3309e533-0799-4c24-9373-6160809a795d'],
  ['arrow', 'cc77a883-4cdc-4456-b352-0329df215981'],
  ['arrow', '6e2c5e0f-eb8e-4286-b6f6-11488fc735cf'],
  ['arrow', 'badc7c43-9893-4d47-83b4-3463d1516a8d'],
  ['arrow', 'bd827bf1-b7da-4762-b24b-98e12d735d8d'],
  ['arrow', '2e250086-badc-4306-b236-58b9d8732b89'],
  ['arrow', '7991e4b8-8a25-4bca-b0ed-de280c9c8898'],
  ['arrow', '69cdefd3-0ac6-4d24-a94e-ddc7c8333ca0'],
  ['arrow', 'b79f208f-f886-4ab9-9961-f7ceb2be8405'],
  ['arrow', 'a4caef41-a62e-4f65-9ca3-aa292dac287e'],
  ['arrow', '217ab7cc-05d1-49b8-8ebd-02703ede7ec5'],

  // ── lightning (14) ────────────────────────────────────────────────────
  ['lightning', 'c5bcfaa6-b9f6-4305-bce0-ec3b9c38b18c'],
  ['lightning', '6ab7347f-b1ba-4b9b-ae90-60c6748d83b3'],
  ['lightning', '7f7a719c-d81b-43fd-a574-55e45b5e0eca'],
  ['lightning', '4c1bb49d-e6c2-49cf-8c12-47b628a35b0a'],
  ['lightning', '5341d44d-4e27-492b-84f7-0b5961877f2d'],
  ['lightning', '5a735f70-b9c6-497a-818d-8c6c40eab789'],
  ['lightning', 'aaeff791-10f9-4456-925f-f4cacf1960c8'],
  ['lightning', '458aaf31-7b76-4bb0-b0ba-ee309dd5f918'],
  ['lightning', 'f5e950ad-2005-4afd-98d9-14964f704e8f'],
  ['lightning', '33b56a42-44b6-49cf-b889-91f7a1fa6300'],
  ['lightning', 'd2966a8d-fcc0-4cfd-adb2-e41c6cbaba24'],
  ['lightning', 'c051d9a1-c75f-4816-8b21-44f4c069983d'],
  ['lightning', '740e0adc-d07b-4076-b8e5-4d0704112b44'],
  ['lightning', '7f43ef8b-c1ea-405b-b16f-d28054cc62eb'],
  ['lightning', '256db1af-d33b-4ddb-b712-434967283fbc'],

  // ── void_vortex (15) ──────────────────────────────────────────────────
  ['void_vortex', '93a0643b-3aa9-4863-864d-20be22eef6a5'],
  ['void_vortex', 'ff6a924b-0b86-47a3-be6c-4690ed8fa022'],
  ['void_vortex', '191470b2-4896-40bd-8219-b3b9e2e8cf4c'],
  ['void_vortex', '4f4bdc51-9b3d-46ea-96c6-548e63314133'],
  ['void_vortex', 'ead0fe8b-a71b-41a2-93c6-7ea88c2f57ec'],
  ['void_vortex', '5853452b-5a11-4274-905a-8074839a8383'],
  ['void_vortex', '587e78ea-e6f6-4d08-a378-016d78ad428c'],
  ['void_vortex', '7ce24e79-10bd-4b7c-95c2-cb8699479518'],
  ['void_vortex', '4a1e530f-75ee-425f-bd58-9b0b9cd6f6e3'],
  ['void_vortex', '0faae550-6d1d-49e6-b44b-2d3814c0efa2'],
  ['void_vortex', '967711ab-8d61-4d85-a9b8-f2bec988dbee'],
  ['void_vortex', 'f6e8affb-2780-424a-ab11-a7dde0deef05'],
  ['void_vortex', 'b5a771da-46e3-4962-aa7a-dfcf2bf7c524'],
  ['void_vortex', 'd636405e-6418-4753-8784-ef7d84f4c057'],
  ['void_vortex', '71f7271d-7ddd-4ed6-a397-f6312c262636'],

  // ── divine_hammer (14) ────────────────────────────────────────────────
  ['divine_hammer', 'a6f9bdf9-7a70-48f6-97f0-871709e8e5d3'],
  ['divine_hammer', '793fb91d-ef5c-4824-8421-5f2fcdea2527'],
  ['divine_hammer', 'b11380aa-2791-4973-b1f6-8864dc0ea6d3'],
  ['divine_hammer', '01e0d88e-1630-427c-8522-7a4c2a8db935'],
  ['divine_hammer', '1e9d25c2-97dc-45f6-9bf7-ac081ad6ff35'],
  ['divine_hammer', '457ae0c3-ee61-457a-bc04-8264a2db6a79'],
  ['divine_hammer', '875e6090-39c1-4ffe-8877-e28ebd36384f'],
  ['divine_hammer', '1676667c-8a02-479d-aa3f-da644b5364e5'],
  ['divine_hammer', 'dd6cd19f-a071-4133-aca0-5f620c799f77'],
  ['divine_hammer', '4787450e-ef23-4e0d-b7ee-47658513ecf6'],
  ['divine_hammer', 'ca98e955-bfa1-4338-90a4-169afe50decc'],
  ['divine_hammer', '0bb9cc87-2f18-49d3-8427-750014a53cb6'],
  ['divine_hammer', '628ba5c4-efc1-4b74-a041-9c5a1dd4ae57'],
  ['divine_hammer', '894e6994-3b9f-40a6-88d1-33b0a5f839a3'],
  ['divine_hammer', '39cd76ba-3336-4be4-b0e2-15983ad36b4f'],

  // ── xp_red (15) ───────────────────────────────────────────────────────
  ['xp_red', '1110cbb8-fac6-435e-8cac-f5ffdaa3b09a'],
  ['xp_red', '9a2d36a5-41e0-4690-acbb-59158409c043'],
  ['xp_red', '4744f520-678d-4d24-8033-ef70d2eec395'],
  ['xp_red', '1f99e5b8-31eb-48aa-99fb-a4c13e130bef'],
  ['xp_red', '6c3544ad-698d-4ee1-a2aa-82cb38d44867'],
  ['xp_red', '581957d1-fc7b-4391-9350-f5999316010b'],
  ['xp_red', '415c50b1-92ad-42ff-8c3a-8e8a857ee087'],
  ['xp_red', 'fc6022f5-b2eb-48ab-9638-eb864d69b969'],
  ['xp_red', 'ccbcea0a-ae8d-4a32-818a-e456cc29d231'],
  ['xp_red', 'e705488b-6de6-4f74-ad6b-dac644865440'],
  ['xp_red', 'fc24458d-d20d-4fc5-a977-ea6de9472d78'],
  ['xp_red', '88d9f660-9a32-4cbb-a466-1c8c38647e6b'],
  ['xp_red', 'd78c04e9-5b88-49c7-8ad3-6be3ca191382'],
  ['xp_red', '365f47d1-d3a5-4cf8-bcdc-7bdc627e724a'],
  ['xp_red', '4831f538-6d21-4c38-9d6e-b4b66cbae01c'],

  // ── knives (50+) ──────────────────────────────────────────────────────
  ['knives', 'be68018f-312e-44ef-ad01-ffe4e34ee941'],
  ['knives', '57ac5f6a-d5c6-4faf-9571-ea0c7ed235d3'],
  ['knives', '829e0ff4-7c97-4988-81ba-a56f7fd02da1'],
  ['knives', 'c7efd2b1-8eba-4666-8a1f-580a28b1a192'],
  ['knives', '4f455f81-5ceb-44b3-9573-2a0b679f8c9b'],
  ['knives', 'f86c7698-0c70-4cff-bb58-9db780001f55'],
  ['knives', '411b76f5-3f0f-4d60-be7f-b19027389b3e'],
  ['knives', 'de1172d0-7881-44c2-bf98-5bbf5751b374'],
  ['knives', '299056f0-be05-4468-b16f-ecf32ca1e5f3'],
  ['knives', '2658f4f8-72d7-4129-9b07-103110452dbe'],
  ['knives', '87f88ee7-0417-49b3-9e85-2243b46f11cd'],
  ['knives', '9c57909c-513e-4f39-a562-d53608c27a6d'],
  ['knives', '11bf7a9b-243a-4898-884f-e7fb9c3c27ec'],
  ['knives', 'a02f435b-570c-4258-b781-c08a86df49e7'],
  ['knives', 'd6996294-5be9-4b55-b21d-7a250ffcea43'],
  ['knives', '98bed830-a734-4861-81ce-2c404c99a800'],
  ['knives', '556d700e-f377-4e8c-9616-07fa57337ddb'],
  ['knives', '1ea87632-7830-4348-aa18-ea546da0647f'],
  ['knives', 'af89e8f8-177e-40dc-a3e3-d92d5fa7446a'],
  ['knives', '6eced893-26f9-4e7e-b359-bc9dc717bfea'],
  ['knives', '30e161d6-bd55-47d8-911e-1b34fced7623'],
  ['knives', '917ce13e-a296-4300-8ff1-f5168738bf1c'],
  ['knives', '61e15ceb-77c7-49b2-a68a-88770dad6036'],
  ['knives', '36823974-cfb5-44ee-a7d9-10163f804c52'],
  ['knives', '52707e86-c48f-4c37-a447-3f873605deea'],
  ['knives', '544b597b-e31a-4035-863d-e57315c88d7c'],
  ['knives', 'a840fb07-c13f-46ed-8bae-7c0e789a4b71'],
  ['knives', 'bbf98830-54dd-4d27-810d-ee5116123402'],
  ['knives', '4036065e-7e08-4026-bbb9-710d4062ba0b'],
  ['knives', '999b3683-10c7-4527-b87a-9f5b6f009e5a'],
  ['knives', 'a00860e5-cf32-4fca-aab5-184aee340fa9'],
  ['knives', 'e43cd3e6-5723-4879-9781-e201177053ef'],
  ['knives', '644a8439-1063-4016-87a4-e2b3f2db56df'],
  ['knives', 'd14bf395-c382-48fe-a077-54a1f480ca71'],
  ['knives', 'cfba10ba-297c-4f8c-b34b-9690891bfdc8'],
  ['knives', '6a6cbf63-47b2-426c-a3be-a03e6b2d2138'],
  ['knives', '5bfaf925-0307-44c5-891b-213ca19fd2c1'],
  ['knives', 'cac6e557-9512-4b7e-a8d4-511da3532ef4'],
  ['knives', '52528532-7019-4ac3-b56c-d3f3e52948e6'],
  ['knives', '6b0d837d-84b7-4a0c-8023-cf19a97351fc'],
  ['knives', '2e9af252-4974-4a05-ac26-716bde12cfec'],
  ['knives', '13aba3a9-e331-4749-8955-7d1882bf55ac'],
  ['knives', 'ebbe9d90-7d34-45bb-9529-3df379a18bef'],
  ['knives', 'aa4b66b1-48e6-47bc-8726-db84ba72e4d7'],
  ['knives', '08751c41-639a-429b-8c02-cddc75db7317'],
  ['knives', '638a07cc-9629-42da-b752-d00eeb7c7df8'],
  ['knives', 'd3a0dff2-601f-4a66-a9ae-eb51e7048638'],
  ['knives', 'd8f0a269-7a24-4eed-9916-b1e403ce328e'],
  ['knives', '1b5ad657-242f-47a9-b2a8-825fc42da4d8'],
  ['knives', '289b42e5-5bd2-4282-8cce-2f28f7f38003'],
  ['knives', '263ded8a-b642-4a79-ad50-14a4d8c3fb6e'],
  ['knives', '0f8b17f1-9175-4d34-9782-c53d3a0317ee'],
  ['knives', 'e00897fb-b36b-49bd-a772-6abdceb9a416'],
  ['knives', 'c7a12a9b-8c82-42c9-bb09-785925557000'],
  ['knives', 'c6ba4eba-cfc9-4cee-9b04-d640d9c27e38'],
  ['knives', 'ab5bb6e7-ccdc-4198-918a-92c9299c800c'],
  ['knives', 'b2fee0dc-8615-4d78-ba9c-dcf0aff1ec14'],
  ['knives', '917f2954-a022-4feb-a100-fb0345fc3bc3'],
  ['knives', '08cc3f67-fd88-4a7c-96b3-93372f9fbd5b'],
  ['knives', '378dab5a-66a6-4319-baf4-046ddd463b70'],
  ['knives', '95b12b58-c8eb-4908-a5b6-e7dafbb73a2c'],
  ['knives', 'dfc1dd90-37d9-4a68-9df5-d9dc1d454d2e'],
  ['knives', '63110a82-e759-40db-b4d1-80616c8c40c9'],
];

// dedupe (some uuids appeared in multiple offset pages from pagination races)
const seen = new Set();
const uniqueTargets = TARGETS.filter(([, uuid]) => {
  if (seen.has(uuid)) return false;
  seen.add(uuid);
  return true;
});

function urlFor(uuid) {
  return `https://backblaze.pixellab.ai/file/pixellab-characters/objects/${OWNER_UUID}/${uuid}/rotations/unknown.png`;
}

function destFor(concept, uuid) {
  return path.join(DEST_BASE, concept, `${uuid.slice(0, 8)}.png`);
}

async function downloadOne(concept, uuid) {
  const url = urlFor(uuid);
  const dest = destFor(concept, uuid);
  await fs.mkdir(path.dirname(dest), { recursive: true });

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`${res.status} ${res.statusText} → ${url}`);
  }
  const ab = await res.arrayBuffer();
  if (ab.byteLength === 0) {
    throw new Error(`empty body → ${url}`);
  }
  await fs.writeFile(dest, Buffer.from(ab));
  return ab.byteLength;
}

async function runWithConcurrency(items, concurrency, worker) {
  const results = { ok: 0, fail: 0, bytes: 0, errors: [] };
  let idx = 0;
  async function next() {
    while (true) {
      const i = idx++;
      if (i >= items.length) return;
      const [concept, uuid] = items[i];
      try {
        const n = await worker(concept, uuid);
        results.ok += 1;
        results.bytes += n;
        if (results.ok % 25 === 0) {
          console.log(`[${results.ok}/${items.length}] ${concept}/${uuid.slice(0, 8)} ok (${n}B)`);
        }
      } catch (err) {
        results.fail += 1;
        results.errors.push(`${concept}/${uuid.slice(0, 8)}: ${err.message}`);
      }
    }
  }
  await Promise.all(Array.from({ length: concurrency }, next));
  return results;
}

const start = Date.now();
console.log(`PixelLab batch pull: ${uniqueTargets.length} objects, concurrency=${CONCURRENCY}`);
const r = await runWithConcurrency(uniqueTargets, CONCURRENCY, downloadOne);
const sec = ((Date.now() - start) / 1000).toFixed(1);
console.log(`\nDONE in ${sec}s — ok=${r.ok}  fail=${r.fail}  bytes=${(r.bytes / 1024).toFixed(1)}KB`);
if (r.errors.length) {
  console.log('\nFAILURES:');
  for (const e of r.errors.slice(0, 20)) console.log('  ' + e);
  if (r.errors.length > 20) console.log(`  ... and ${r.errors.length - 20} more`);
}
