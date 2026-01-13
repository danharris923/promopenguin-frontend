/**
 * Fashion Deal Generation Service for PromoPenguin
 *
 * This service generates synthetic fashion deal cards from local brand images.
 * Cards rotate every 15 minutes to match the site's shuffle timing.
 *
 * Usage:
 *   import { getFashionDeals, getTopTierFashionDeals } from './fashion-deals'
 *   const fashionDeals = await getFashionDeals()
 */

import { Deal } from '@/types/deal'
import {
  FASHION_BRANDS,
  FashionBrand,
  generateFashionDeal,
  getPremiumBrands,
  getTopTierBrands,
} from './fashion-brands'
import { getStoreBySlug } from './db'

// =============================================================================
// IMAGE PATH CONFIGURATION
// Images are served from public/images/fashion/{brand}/
// =============================================================================

/**
 * Pre-built image manifest - actual filenames from public/images/fashion/
 */
export const IMAGE_MANIFEST: Record<string, string[]> = {
  'abercrombie-fitch': ['abercrombie___f_01_7cbeefff.jpg','abercrombie___f_03_854461af.jpg','abercrombie___f_04_85a6b380.jpg','abercrombie___f_05_f2206963.jpg','abercrombie___f_08_6f019784.jpg','abercrombie___f_09_8fcab9e3.jpg','abercrombie___f_10_468414eb.jpg','abercrombie___f_11_924223fe.jpg','abercrombie___f_12_050c78d9.jpg','abercrombie___f_14_139dc62b.jpg','abercrombie___f_15_59870d07.png'],
  'aerie': ['aerie_01_9b0513b9.jpg','aerie_02_abc4f1ba.jpg','aerie_03_ae673d37.jpg','aerie_04_3e51512a.jpg','aerie_05_c661d1c0.jpg','aerie_06_fbd04c76.jpg','aerie_07_43417503.jpg','aerie_08_d8b4c77f.jpg','aerie_09_daba36c0.jpg','aerie_10_522728f3.png','aerie_11_b5e03293.jpg','aerie_12_0de45417.jpg','aerie_14_085bef9b.jpg','aerie_15_06620dfd.png'],
  'aldo': ['aldo_01_7b687e49.jpg','aldo_02_b5b0fbcd.jpg','aldo_03_f0801955.jpg','aldo_05_bd7a603e.jpg','aldo_07_a0bcb4e3.jpg','aldo_08_04f34a5c.jpg','aldo_09_a3161f41.jpg','aldo_10_58b1d131.jpg','aldo_11_b477547b.jpg','aldo_12_ca0a6057.jpg','aldo_13_7a31ec0b.jpg','aldo_14_7ea752a7.jpg','aldo_15_2689c30f.jpg'],
  'ardene': ['ardene_01_04d06382.jpg','ardene_02_f25dac6a.jpg','ardene_03_56b58de7.jpg','ardene_04_607403f6.jpg','ardene_05_b6f149e3.jpg','ardene_06_dbd909fc.jpg','ardene_07_9f7e9451.jpg','ardene_08_7f7420d4.jpg','ardene_09_1ae53d9f.jpg','ardene_10_d0e9e809.jpg','ardene_11_6bc5be85.jpg','ardene_12_cc326449.jpg','ardene_14_3eb40027.jpg','ardene_15_fbe9093d.jpg'],
  'aritzia': ['aritzia_01_84fd03c4.jpg','aritzia_02_840f2d5d.jpg','aritzia_03_bcb08fe1.jpg','aritzia_04_6f928cc7.jpg','aritzia_05_5652ecc8.webp','aritzia_06_9a87d65f.jpg','aritzia_07_9f995236.jpg','aritzia_08_11d55afd.jpg','aritzia_09_4e088ab6.jpg','aritzia_10_af932dc9.jpg','aritzia_11_3f2f5631.jpg','aritzia_12_47e6ea0f.jpg','aritzia_13_036c8daa.jpg','aritzia_14_0b0b4e59.jpg','aritzia_15_74458503.jpg'],
  'alo-yoga': ['alo_yoga_01_e10afafc.jpg','alo_yoga_02_fad25bae.jpg','alo_yoga_03_fb4ca937.jpg','alo_yoga_04_8b2778e4.jpg','alo_yoga_05_d3c1091c.jpg','alo_yoga_06_4b7f8287.jpg','alo_yoga_07_076e49c7.jpg','alo_yoga_08_ee7a3971.png','alo_yoga_09_d13db6ce.jpg','alo_yoga_10_db2cc0d7.jpg','alo_yoga_11_2b3f78ed.jpg','alo_yoga_12_d00b166d.jpg','alo_yoga_13_e3fedf80.jpg','alo_yoga_14_928ab1bb.jpg'],
  'american-eagle': ['american_eagle_01_f3e614cf.png','american_eagle_02_b0add819.png','american_eagle_04_d84bd5c6.jpg','american_eagle_06_d1664b83.jpg','american_eagle_07_8b7af9c4.jpg','american_eagle_08_4b3ac7be.jpg','american_eagle_09_05801441.jpg','american_eagle_10_d2aaf327.jpg','american_eagle_11_157b18be.jpg','american_eagle_12_16eaf426.jpg','american_eagle_13_a378e98c.jpg','american_eagle_14_48db7574.jpg','american_eagle_15_87e30905.jpg'],
  'anthropologie': ['anthropologie_02_2081dc87.jpg','anthropologie_03_c91c47ee.jpg','anthropologie_05_66e7bd1b.jpg','anthropologie_06_f0ebc0c4.jpg','anthropologie_07_a365fd3a.jpg','anthropologie_08_5e492982.png','anthropologie_09_6bed41a8.jpg','anthropologie_10_00379228.jpg','anthropologie_11_ee196515.jpg','anthropologie_12_c46ba0ee.jpg','anthropologie_13_6951a081.jpg','anthropologie_14_a18add66.jpg'],
  'birkenstock': ['birkenstock_01_6cedde8c.jpg','birkenstock_02_b8d35e72.webp','birkenstock_03_86d91926.jpg','birkenstock_04_af4952f4.jpg','birkenstock_05_488bb757.jpg','birkenstock_06_298948de.jpg','birkenstock_07_f6c718db.jpg','birkenstock_08_e6c2b809.jpg','birkenstock_09_cfa6b563.jpg','birkenstock_11_86492af2.jpg','birkenstock_12_9d83fcc0.jpg','birkenstock_13_cdafd289.jpg','birkenstock_14_6a1d5623.jpg','birkenstock_15_5bbb4d6c.png'],
  'brooklinen': ['brooklinen_01_9150c53e.jpg','brooklinen_02_8b372cf8.jpg','brooklinen_03_fa8f7d9b.jpg','brooklinen_04_47e2877b.jpg','brooklinen_05_e533ff10.jpg','brooklinen_06_13f00fc8.png','brooklinen_07_0719d986.png','brooklinen_08_b0e51d1c.jpg','brooklinen_09_3ec1a822.jpg','brooklinen_10_780b13f3.jpg','brooklinen_11_5fb2580e.jpg','brooklinen_12_b55cb891.jpg','brooklinen_13_827a8b7f.jpg','brooklinen_14_d71d7b0d.jpg','brooklinen_15_e4126430.jpg'],
  'cb2': ['cb2_01_b041ec16.jpg','cb2_02_5a7639af.jpg','cb2_03_f3b1fbc5.jpg','cb2_04_fe1c3426.jpg','cb2_05_c6a7dd7c.png','cb2_06_e5606b4e.jpg','cb2_07_281cbb77.png','cb2_08_6627a023.jpg','cb2_09_eb21209c.jpg','cb2_10_0c498322.jpg','cb2_11_7c236698.jpg','cb2_12_6a8de540.png','cb2_13_75d4d78c.png','cb2_14_9467f37a.jpg','cb2_15_2c12648f.jpg'],
  'charlotte-tilbury': ['charlotte_tilbu_01_51c4cf06.jpg','charlotte_tilbu_02_eb44f817.png','charlotte_tilbu_03_e6252e27.jpg','charlotte_tilbu_04_0801bd9b.jpg','charlotte_tilbu_05_9f4a83c2.jpg','charlotte_tilbu_06_9eb3fd4d.jpg','charlotte_tilbu_07_770cd4dd.jpg','charlotte_tilbu_08_6c267ffa.jpg','charlotte_tilbu_09_69723dae.jpg','charlotte_tilbu_10_255bf699.jpg','charlotte_tilbu_11_58113073.png','charlotte_tilbu_12_d3df5c81.jpg','charlotte_tilbu_13_be162d59.jpg','charlotte_tilbu_14_a5422f14.jpg','charlotte_tilbu_15_a8b98461.jpg'],
  'colleen-rothschild': ['colleen_rothsch_01_168b167e.jpg','colleen_rothsch_02_5882c5fc.jpg','colleen_rothsch_03_3f9d38e8.jpg','colleen_rothsch_04_acb3ba31.jpg','colleen_rothsch_05_eb619227.jpg','colleen_rothsch_06_6e030cf8.jpg','colleen_rothsch_07_c7152563.jpg','colleen_rothsch_08_ca165000.jpg','colleen_rothsch_09_fe4a2bff.jpg','colleen_rothsch_10_a075eca9.jpg','colleen_rothsch_12_7e20f82e.jpg','colleen_rothsch_13_1c97be3a.jpg','colleen_rothsch_14_c18c40d3.jpg','colleen_rothsch_15_e1c04b46.jpg'],
  'cotton-on': ['cotton_on_01_e6b4fa14.jpg','cotton_on_02_340a73ed.jpg','cotton_on_03_35a4da24.jpg','cotton_on_04_3af4d036.jpg','cotton_on_05_3614b588.jpg','cotton_on_06_1eb662e8.jpg','cotton_on_07_40eb9fca.jpg','cotton_on_08_29cf6bab.jpg','cotton_on_09_b125bbdd.jpg','cotton_on_10_fe3bf556.jpg','cotton_on_11_e9439e38.jpg','cotton_on_12_e7c308f4.jpg','cotton_on_13_6e91fdc1.jpg','cotton_on_14_2a119815.jpg','cotton_on_15_21abb0e1.jpg'],
  'crate-barrel': ['crate___barrel_02_3eb87d21.jpg','crate___barrel_03_ac3f45ed.jpg','crate___barrel_04_7f396e6c.jpg','crate___barrel_06_b23b8776.jpg','crate___barrel_07_df64e7ca.jpg','crate___barrel_09_abcf0200.jpg','crate___barrel_11_0391a1f8.jpg','crate___barrel_13_b9670171.jpg','crate___barrel_14_d121fb28.jpg'],
  'dime-beauty': ['dime_beauty_01_a228a65d.jpg','dime_beauty_02_d1ecb0b8.png','dime_beauty_03_b0e329ef.jpg','dime_beauty_06_b8b0cb04.jpg','dime_beauty_07_995f44d7.jpg','dime_beauty_11_7c39e5ef.jpg','dime_beauty_12_c0e98bb4.jpg','dime_beauty_14_1b52aeaf.jpg','dime_beauty_15_452a0ed7.png'],
  'dyson': ['dyson_01_9f664140.jpg','dyson_02_96f81ce7.jpg','dyson_03_f990f23d.jpg','dyson_04_cd44d145.jpg','dyson_05_ee1d2029.jpg','dyson_06_2ecf063b.jpg','dyson_07_b77f271e.jpg','dyson_08_41bdccb9.jpg','dyson_09_1d81e75f.jpg','dyson_11_23dabc80.jpg','dyson_13_d6163510.jpg','dyson_14_4273969f.jpg','dyson_15_910ce8f2.jpg'],
  'elf-cosmetics': ['e_l_f__cosmetic_01_3ea75bbb.jpg','e_l_f__cosmetic_02_6f2f46fe.jpg','e_l_f__cosmetic_03_84c43e9a.jpg','e_l_f__cosmetic_04_70211219.jpg','e_l_f__cosmetic_05_acad5895.jpg','e_l_f__cosmetic_06_133beb41.jpg','e_l_f__cosmetic_07_99d83bca.png','e_l_f__cosmetic_08_8a836418.jpg','e_l_f__cosmetic_09_ca9e8a96.png','e_l_f__cosmetic_10_4fd5e587.png','e_l_f__cosmetic_11_af7f1889.jpg','e_l_f__cosmetic_12_7142e82b.jpg','e_l_f__cosmetic_13_39e80493.jpg','e_l_f__cosmetic_14_a9a5f192.jpg','e_l_f__cosmetic_15_2456b9bf.jpg'],
  'foot-locker': ['footlocker_01_78de110b.jpg','footlocker_03_2cd9d05e.jpg','footlocker_04_d05e8b80.jpg','footlocker_05_54566ac7.jpg','footlocker_06_a622d4dd.jpg','footlocker_07_5517f2b6.jpg','footlocker_08_f4bd258a.jpg','footlocker_09_412e2a30.jpg','footlocker_10_5cbda637.jpg','footlocker_11_0c736a77.jpg','footlocker_12_db7ae965.jpg','footlocker_13_cec56706.jpg','footlocker_14_076aa6e4.png','footlocker_15_6f672fe3.png'],
  'free-people': ['free_people_01_092d8173.jpg','free_people_02_76969954.jpg','free_people_03_516d424a.jpg','free_people_04_e813fc85.png','free_people_05_ebe091c7.jpg','free_people_06_8870b4d7.jpg','free_people_07_1339d191.jpg','free_people_08_83e8ec00.jpg','free_people_09_8de2c1da.jpg','free_people_10_0e741daa.jpg','free_people_11_9236ac15.jpg','free_people_12_7dd2fb7e.jpg','free_people_13_10ab712c.jpg','free_people_14_fc03a819.jpg','free_people_15_e1ab358d.jpg'],
  'guess': ['guess_01_29080ed0.jpg','guess_02_adc03d37.jpg','guess_03_b757abb4.jpg','guess_04_a4029d64.jpg','guess_05_515e9b06.jpg','guess_06_d0d93e84.jpg','guess_07_8c23fe92.jpg','guess_08_a001452e.jpg','guess_09_33b10757.jpg','guess_10_8e52bbb5.jpg','guess_11_14607169.jpg','guess_12_d80cc3d6.jpg','guess_13_f1b5d8df.jpg','guess_14_fd67c2c0.jpg','guess_15_c0bec2b7.png'],
  'lululemon': ['lululemon_01_3b5110e7.jpg','lululemon_02_e457b0e2.jpg','lululemon_03_268c563c.jpg','lululemon_04_b229a1b0.jpg','lululemon_05_e6801b36.jpg','lululemon_06_c302a8ce.jpg','lululemon_07_2d073017.jpg','lululemon_08_ec9711ac.jpg','lululemon_09_8636b0b2.jpg','lululemon_10_e95d96b9.jpg','lululemon_11_a62cb234.jpg','lululemon_12_859ac367.jpg','lululemon_13_afbde11c.jpg','lululemon_14_e8a183af.jpg','lululemon_15_a36ffc10.png'],
  'lulus': ['lulus_01_fc2b5617.jpg','lulus_02_7e892f37.jpg','lulus_03_c9e0db1c.jpg','lulus_04_53346765.jpg','lulus_05_a9f1e6fb.jpg','lulus_07_3745fc7a.jpg','lulus_08_872f83e2.jpg','lulus_09_b7a6a76a.jpg','lulus_10_24c760b6.webp','lulus_12_ad30a6cb.jpg','lulus_13_bb96ee79.jpg','lulus_14_0a22e6da.webp','lulus_15_8cc23b94.jpg'],
  'madewell': ['madewell_01_45977615.jpg','madewell_02_9bb63f52.jpg','madewell_03_62659ed6.jpg','madewell_04_a857061d.jpg','madewell_05_6b677338.jpg','madewell_06_a8f3ed1f.jpg','madewell_07_012e3e29.jpg','madewell_08_442762bf.jpg','madewell_09_8337223d.jpg','madewell_10_df89570c.jpg','madewell_11_92f8bd7e.jpg','madewell_12_ecb64125.jpg','madewell_13_29089f38.jpg','madewell_14_2cf677ed.jpg','madewell_15_4955742c.jpg'],
  'merit-beauty': ['merit_beauty_01_9ea612c6.jpg','merit_beauty_02_12b4caf2.jpg','merit_beauty_03_0347b374.jpg','merit_beauty_04_8468df6d.jpg','merit_beauty_05_df2c2112.jpg','merit_beauty_06_b878df5e.jpg','merit_beauty_07_ae48bf89.jpg','merit_beauty_08_174818d3.png','merit_beauty_09_380f5794.jpg','merit_beauty_10_4eae9cb0.png','merit_beauty_11_abffbc1d.jpg','merit_beauty_12_fd00b956.jpg','merit_beauty_13_bfb01e93.jpg','merit_beauty_14_bc12dfb2.jpg','merit_beauty_15_a4992360.png'],
  'nasty-gal': ['nasty_gal_01_065a1e43.jpg','nasty_gal_02_15822ad1.jpg','nasty_gal_03_75aba53e.jpg','nasty_gal_04_fe0e0ae9.jpg','nasty_gal_05_d48014ba.jpg','nasty_gal_06_c467466e.jpg','nasty_gal_07_597db4d3.jpg','nasty_gal_08_87b3f83d.jpg','nasty_gal_09_2bacd95b.jpg','nasty_gal_10_1c7f459a.jpg','nasty_gal_11_74164f41.jpg','nasty_gal_12_3c918add.jpg','nasty_gal_13_38ce93a9.jpg','nasty_gal_14_fe133876.jpg','nasty_gal_15_6f4e971d.jpg'],
  'new-balance': ['new_balance_01_30d7f1fa.jpg','new_balance_02_80444383.jpg','new_balance_03_5983fd94.jpg','new_balance_04_a636ead9.jpg','new_balance_05_2f84ec1c.jpg','new_balance_06_13cebdd4.jpg','new_balance_07_99a1cf0f.jpg','new_balance_08_41af31af.jpg','new_balance_09_21909e2c.jpg','new_balance_10_6d02fd89.jpg','new_balance_11_69274740.jpg','new_balance_12_0aeae743.jpg','new_balance_13_6166ccdb.jpg','new_balance_14_acd01126.jpg','new_balance_15_a7f6a694.jpg'],
  'pottery-barn': ['pottery_barn_01_dd0f17d5.jpg','pottery_barn_02_8c59bfe3.jpg','pottery_barn_03_e55b335f.jpg','pottery_barn_04_bd911d91.jpg','pottery_barn_05_5663ae6d.jpg','pottery_barn_06_6591b1e3.jpg','pottery_barn_07_749d5153.jpg','pottery_barn_08_ef2a2288.jpg','pottery_barn_09_270f1fb0.jpg','pottery_barn_10_e44a9918.jpg','pottery_barn_11_a9f40930.jpg','pottery_barn_12_2d5a4627.jpg','pottery_barn_13_61b4ae9d.jpg','pottery_barn_14_547b1c48.jpg','pottery_barn_15_4182f32c.jpg'],
  'prettylittlething': ['prettylittlethi_01_ba8d173b.jpg','prettylittlethi_02_5fa07a6c.jpg','prettylittlethi_03_b3e2e810.png','prettylittlethi_04_74410e36.jpg','prettylittlethi_05_12fe7f7f.jpg','prettylittlethi_06_5f4f61dc.jpg','prettylittlethi_07_851c08dc.jpg','prettylittlethi_08_f70243fa.jpg','prettylittlethi_09_2d48eb9a.jpg','prettylittlethi_10_d3f98aef.jpg','prettylittlethi_11_afaced69.jpg','prettylittlethi_12_97ff5a30.jpg'],
  'princess-polly': ['princess_polly_01_12507cb6.jpg','princess_polly_02_f616eb61.jpg','princess_polly_03_8f991e48.jpg','princess_polly_04_c23c4de3.jpg','princess_polly_05_ee8a1a36.png','princess_polly_06_1c135ab9.jpg','princess_polly_07_c642aeef.jpg','princess_polly_08_32c6d259.png','princess_polly_09_e4e38858.jpg','princess_polly_10_0e481c5d.png','princess_polly_11_f7dee934.jpg','princess_polly_12_adfc70be.jpg','princess_polly_13_a348b2a9.jpg','princess_polly_14_9445bd83.png','princess_polly_15_5ec2ebe1.jpg'],
  'revolve': ['revolve_01_0e0a5b61.jpg','revolve_02_01a561c6.jpg','revolve_03_583ef53b.jpg','revolve_04_4d2754f7.jpg','revolve_05_3edafb61.jpg','revolve_06_7ac0fc72.jpg','revolve_07_98d435ff.jpg','revolve_08_feada9fe.jpg','revolve_09_5310db86.jpg','revolve_10_107cfa4d.jpg','revolve_11_9acac23e.jpg','revolve_12_2b4c2550.jpg','revolve_13_270ca9f4.jpg','revolve_14_826cb958.jpg','revolve_15_e8f4ca32.jpg'],
  'shopbop': ['shopbop_01_d7804eb2.jpg','shopbop_02_898dfd0d.png','shopbop_03_563ced35.jpg','shopbop_04_a46b7a53.jpg','shopbop_05_318dde97.png','shopbop_06_e0dc229a.jpg','shopbop_08_14bf92b9.jpg','shopbop_10_391a0c37.jpg','shopbop_11_63054025.jpg','shopbop_12_02a25957.jpg','shopbop_13_67c39a8d.jpg','shopbop_14_ebf514ba.jpg','shopbop_15_22bed544.jpg'],
  'simons': ['simons_01_069b3f1a.jpg','simons_02_3d524306.jpg','simons_03_559b7fba.jpg','simons_04_58820dbc.jpg','simons_05_4622e256.jpg','simons_06_267395d8.jpg','simons_07_4aba101d.jpg','simons_08_20e01208.jpg','simons_09_f5c4fd20.jpg','simons_10_d9a6faf9.jpg','simons_11_9498f771.jpg','simons_12_26bb3930.jpg','simons_13_b1819161.jpg','simons_14_6f6ede37.jpg'],
  'skims': ['skims_01_63f89c07.jpg','skims_02_b7be2c7e.jpg','skims_03_a0ad14ca.jpg','skims_04_898346b9.jpg','skims_05_6916c04f.png','skims_06_cee9c646.jpg','skims_07_880b649d.jpg','skims_08_ab6c95cd.jpg','skims_11_5149b16c.jpg','skims_12_6f9bc507.jpg','skims_13_aca288fc.jpg','skims_14_cce9bda8.jpg','skims_15_8c221c43.jpg'],
  'steve-madden': ['steve_madden_01_68366ae7.jpg','steve_madden_02_5b3af49b.jpg','steve_madden_03_e840bae7.jpg','steve_madden_04_0d38ae21.jpg','steve_madden_05_0c2e2660.jpg','steve_madden_06_347e25e3.jpg','steve_madden_08_f94bb1f1.jpg','steve_madden_09_5d19796b.jpg','steve_madden_10_fa562cd0.jpg','steve_madden_11_9a40765e.jpg','steve_madden_13_5ec07ac8.jpg','steve_madden_14_c0dfd777.jpg','steve_madden_15_c1eb05db.jpg'],
  'supergoop': ['supergoop_01_fbe97b74.jpg','supergoop_03_4283845a.png','supergoop_04_3ac267c8.jpg','supergoop_05_1c936d9b.webp','supergoop_07_0a34eb4b.jpg','supergoop_11_3696352a.jpg','supergoop_12_84cf0b8e.jpg','supergoop_13_d7707cbe.jpg','supergoop_15_a35b63de.webp'],
  'tarte-cosmetics': ['tarte_cosmetics_01_7719e8f8.jpg','tarte_cosmetics_04_fbbaddc7.jpg','tarte_cosmetics_05_35094d04.jpg','tarte_cosmetics_06_1e6912ab.jpg','tarte_cosmetics_07_3209b82a.jpg','tarte_cosmetics_08_b52ad737.jpg','tarte_cosmetics_09_93addc49.jpg','tarte_cosmetics_10_5df895d3.jpg','tarte_cosmetics_11_86cc21e8.jpg','tarte_cosmetics_12_61867e1c.jpg','tarte_cosmetics_13_3848eac3.jpg','tarte_cosmetics_14_21e197ff.jpg','tarte_cosmetics_15_b50bdc58.jpg'],
  'tula-skincare': ['tula_skincare_01_7483f2c3.webp','tula_skincare_02_48eaa1c3.webp','tula_skincare_03_2d3c5ec2.jpg','tula_skincare_05_d5461323.jpg','tula_skincare_06_98a3a4aa.jpg','tula_skincare_07_5298ce94.jpg','tula_skincare_08_41278405.jpg','tula_skincare_09_b194c008.jpg','tula_skincare_10_4bc906f1.jpg','tula_skincare_11_70dd4ba5.jpg','tula_skincare_12_87f38004.jpg','tula_skincare_13_afd34c90.png','tula_skincare_15_a120119a.jpg'],
  'ugg': ['ugg_01_87caf73f.jpg','ugg_02_d6acfd84.png','ugg_03_c3d20924.jpg','ugg_04_37165592.jpg','ugg_05_ff5a7d61.jpg','ugg_07_3e84b4cb.jpg','ugg_08_56f910c6.jpg','ugg_09_edb429fb.jpg','ugg_11_6afc293b.jpg','ugg_12_0a10d3ed.jpg','ugg_13_810be432.webp','ugg_14_348f236d.jpg','ugg_15_effc16e8.jpg'],
  'urban-outfitters': ['urban_outfitter_01_809e712f.jpg','urban_outfitter_02_01f5691b.jpg','urban_outfitter_03_78af8247.jpg','urban_outfitter_04_d7fc5346.jpg','urban_outfitter_05_83110af9.jpg','urban_outfitter_06_662abef6.jpg','urban_outfitter_07_c1e7ec42.png','urban_outfitter_08_686160b2.jpg','urban_outfitter_09_46ef8073.png','urban_outfitter_10_a3df2c4d.jpg','urban_outfitter_11_ed019b55.jpg','urban_outfitter_12_696b6c62.jpg','urban_outfitter_13_c3e3037b.jpg','urban_outfitter_14_7d848c45.jpg','urban_outfitter_15_eee07618.jpg'],
  'vuori': ['vuori_01_cc6a8980.jpg','vuori_02_0faa5e95.png','vuori_03_83b12d18.jpg','vuori_04_c18d6002.jpg','vuori_05_81c458a3.jpg','vuori_06_22af77e6.jpg','vuori_07_65ff7c87.jpg','vuori_09_e47b8486.jpg','vuori_10_c678b018.jpg','vuori_11_7eea38fb.jpg','vuori_12_5c4afcca.jpg','vuori_14_e974f88a.jpg','vuori_15_8b10db3d.jpg'],
  'west-elm': ['west_elm_01_e2fbc8ba.jpg','west_elm_02_63ab0791.jpg','west_elm_03_98e7353c.jpg','west_elm_04_6ff55116.jpg','west_elm_05_4aafb995.jpg','west_elm_06_2bf2ce59.jpg','west_elm_07_791ad840.jpg','west_elm_08_624a4a77.jpg','west_elm_09_b43714db.jpg','west_elm_10_b7a3c701.jpg','west_elm_11_3a5ac97a.jpg','west_elm_12_7e26b82d.png','west_elm_13_0e767292.jpg','west_elm_14_ba081487.jpg','west_elm_15_22ced9fd.jpg'],
}

/**
 * Get image files for a brand from the manifest
 */
function getBrandImageFiles(folder: string): string[] {
  return IMAGE_MANIFEST[folder] || []
}

// =============================================================================
// IN-MEMORY CACHE
// Caches generated deals for 15 minutes (matches shuffle interval)
// =============================================================================

interface DealCache {
  deals: Deal[]
  timestamp: number
  interval: number
}

let dealCache: DealCache | null = null

/**
 * Get the current 15-minute interval (for cache invalidation)
 */
function getCurrentInterval(): number {
  const now = new Date()
  const minutes = now.getHours() * 60 + now.getMinutes()
  return Math.floor(minutes / 15)
}

/**
 * Check if cache is valid (same 15-minute interval)
 */
function isCacheValid(): boolean {
  if (!dealCache) return false
  return dealCache.interval === getCurrentInterval()
}

// =============================================================================
// DEAL GENERATION
// =============================================================================

/**
 * Generate all fashion deals from brand images
 * Returns deals for ALL brands (top tier + standard)
 */
export async function getFashionDeals(): Promise<Deal[]> {
  // Return cached deals if still valid
  if (isCacheValid() && dealCache) {
    return dealCache.deals
  }

  const deals: Deal[] = []

  // Fetch all store affiliate URLs in parallel for efficiency
  const storePromises = FASHION_BRANDS.map(brand =>
    getStoreBySlug(brand.slug).catch(() => null)
  )
  const stores = await Promise.all(storePromises)

  for (let i = 0; i < FASHION_BRANDS.length; i++) {
    const brand = FASHION_BRANDS[i]
    const images = getBrandImageFiles(brand.folder)
    const store = stores[i]

    if (images.length > 0) {
      const deal = generateFashionDeal(brand, i, images, store?.affiliate_url)
      deals.push(deal)
    }
  }

  // Update cache
  dealCache = {
    deals,
    timestamp: Date.now(),
    interval: getCurrentInterval(),
  }

  return deals
}

/**
 * Get premium-tier fashion deals (highest priority)
 */
export async function getPremiumFashionDeals(): Promise<Deal[]> {
  const allDeals = await getFashionDeals()
  const premiumSlugs = new Set(getPremiumBrands().map(b => b.slug))

  return allDeals.filter(deal => {
    const match = deal.id.match(/^fashion-(.+)-\d+$/)
    if (!match) return false
    return premiumSlugs.has(match[1])
  })
}

/**
 * Get top-tier fashion deals (for page 1 priority)
 */
export async function getTopTierFashionDeals(): Promise<Deal[]> {
  const allDeals = await getFashionDeals()
  const topTierSlugs = new Set(getTopTierBrands().map(b => b.slug))

  return allDeals.filter(deal => {
    const match = deal.id.match(/^fashion-(.+)-\d+$/)
    if (!match) return false
    return topTierSlugs.has(match[1])
  })
}

/**
 * Check if a deal is a fashion affiliate deal
 */
export function isFashionDeal(deal: Deal): boolean {
  return deal.id.startsWith('fashion-')
}

/**
 * Get the brand slug from a fashion deal ID
 */
export function getBrandSlugFromDeal(deal: Deal): string | null {
  const match = deal.id.match(/^fashion-(.+)-\d+$/)
  return match ? match[1] : null
}

/**
 * Get brand configuration for a fashion deal
 */
export function getBrandForDeal(deal: Deal): FashionBrand | null {
  const slug = getBrandSlugFromDeal(deal)
  if (!slug) return null
  return FASHION_BRANDS.find(b => b.slug === slug) || null
}
