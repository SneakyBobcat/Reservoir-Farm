import { useState, useMemo, useEffect } from "react";

// ─── STAGE METADATA ──────────────────────────────────────────────────────────
const STAGE_META = {
  seedling:     { label:"Seedling / Clone", color:"#78BE20", desc:"Establishment phase · low EC · fixed dose" },
  early_growth: { label:"Early Growth",    color:"#78BE20", desc:"Active vegetative growth" },
  late_growth:  { label:"Late Growth",     color:"#5a9a10", desc:"Peak vegetative push" },
  early_flower: { label:"Early Flower",  color:"#e8c045", desc:"Flower initiation · sites forming" },
  peak_flower:  { label:"Peak Flower",   color:"#e07a3a", desc:"Maximum P/K demand · active swell · heaviest feed" },
  late_flower:  { label:"Late Flower",   color:"#d06030", desc:"N-fade · ripen · final swell" },
  flush:        { label:"Flush",           color:"#888",    desc:"Flush only — no nutrients" },
};

// Universal stage sets
const ALL_STAGES      = ["seedling","early_growth","late_growth","early_flower","peak_flower","late_flower","flush"];
const FRUIT_STAGES    = ["seedling","early_growth","late_growth","early_flower","peak_flower","late_flower","flush"];
const VEG_ONLY        = ["seedling","early_growth","late_growth","flush"];
const FLOWER_NO_SEED  = ["early_growth","late_growth","early_flower","peak_flower","late_flower","flush"];
const NO_SEED_NO_FLUSH= ["early_growth","late_growth","early_flower","peak_flower","late_flower"];

const PLANTS = [
  { id:"tomatoes",     name:"Tomatoes",        icon:"🍅", maxStages:[...FRUIT_STAGES] },
  { id:"cannabis",     name:"Cannabis / Hemp", icon:"🌿", maxStages:[...FRUIT_STAGES] },
  { id:"peppers",      name:"Peppers",         icon:"🌶️", maxStages:[...FRUIT_STAGES] },
  { id:"cucumbers",    name:"Cucumbers",       icon:"🥒", maxStages:[...FRUIT_STAGES] },
  { id:"lettuce",      name:"Lettuce / Greens",icon:"🥬", maxStages:[...VEG_ONLY] },
  { id:"herbs",        name:"Herbs & Basil",   icon:"🌱", maxStages:[...VEG_ONLY] },
  { id:"strawberries", name:"Strawberries",    icon:"🍓", maxStages:[...FRUIT_STAGES] },
  { id:"roses",        name:"Roses",           icon:"🌹", maxStages:[...NO_SEED_NO_FLUSH] },
  { id:"orchids",      name:"Orchids",         icon:"🌸", maxStages:[...NO_SEED_NO_FLUSH] },
  { id:"houseplants",  name:"Houseplants",     icon:"🪴", maxStages:[...VEG_ONLY] },
];

const SYSTEM_CONFIGS = {
  "3part": {
    id:"3part", name:"3-Part Classic", parts:3, color:"#78BE20",
    tagline:"FloraMicro · FloraGro · FloraBloom",
    desc:"Clean, versatile foundation for all grow styles.",
    stages:["seedling","early_growth","late_growth","early_flower","peak_flower","late_flower","flush"],
    includedKeys:[],
  },
  "6part": {
    id:"6part", name:"6-Part Advanced", parts:6, color:"#00AEEF",
    tagline:"3-Part + CALiMAGiC · Floralicious Plus · Liquid KoolBloom",
    desc:"Enhanced Ca/Mg support and organic bloom performance.",
    stages:["early_growth","late_growth","early_flower","peak_flower","late_flower","flush"],
    includedKeys:["calimagic","floralicious","koolbloom"],
  },
  "10part": {
    id:"10part", name:"10-Part Professional", parts:10, color:"#F7941D",
    tagline:"6-Part + RapidStart · Ripen · Armor Si · FloraKleen",
    desc:"Maximum yield system with root stimulation and ripening.",
    stages:["early_growth","late_growth","early_flower","peak_flower","late_flower","flush"],
    includedKeys:["calimagic","floralicious","koolbloom","rapidstart","ripen_p","armorsi","florakleen"],
  },
  "florapro_std": {
    id:"florapro_std", name:"FloraPro Standard", parts:"PWD", color:"#1B9E78", isPowder:true,
    tagline:"Ca+Micros · Grow · Bloom · Late Bloom",
    desc:"Powder concentrate program for commercial & high-performance grows. Standard EC.",
    stages:["seedling","early_growth","late_growth","early_flower","peak_flower","late_flower","flush"],
    includedKeys:["fp_ca_micros","fp_grow","fp_bloom","fp_late_bloom"],
  },
  "florapro_highec": {
    id:"florapro_highec", name:"FloraPro High EC", parts:"PWD", color:"#7B4FA8", isPowder:true,
    tagline:"Ca+Micros · Grow · Bloom · Late Bloom",
    desc:"Powder concentrate program optimized for high EC environments and maximum production.",
    stages:["seedling","early_growth","late_growth","early_flower","peak_flower","late_flower","flush"],
    includedKeys:["fp_ca_micros","fp_grow","fp_bloom","fp_late_bloom"],
  },
  "biothrive_basic": {
    id:"biothrive_basic", name:"BioThrive Basic", parts:"2", color:"#E8910A", isPowder:true,
    baseLabel:"BIOTHRIVE 2-PART NUTRIENT PROGRAM",
    tagline:"BioThrive Grow · BioThrive Bloom · CaMg+",
    desc:"Professional 2-part organic-based system. Grow for veg, Bloom for flower — CaMg+ throughout.",
    stages:["early_growth","late_growth","early_flower","peak_flower","late_flower"],
    includedKeys:["bt_grow","bt_bloom_p","bt_camg"],
  },
  "biothrive_custom": {
    id:"biothrive_custom", name:"BioThrive Custom", parts:"7", color:"#2E7D32", isPowder:true,
    baseLabel:"BIOTHRIVE 7-PART NUTRIENT PROGRAM",
    tagline:"2-Part Base + BioRoot · BioWeed · BioBud · BioMarine · Diamond Black",
    desc:"Professional 7-part system with targeted supplements for maximum yield and quality.",
    stages:["early_growth","late_growth","early_flower","peak_flower","late_flower"],
    includedKeys:["bt_grow","bt_bloom_p","bt_camg","bt_bioroot","bt_bioweed","bt_biobud","bt_biomarine","bt_diamond"],
  },
  "maxi_indoor": {
    id:"maxi_indoor", name:"MaxiSeries Indoor", parts:"2", color:"#1565C0", isPowder:true,
    baseLabel:"MAXI SERIES 2-PART INDOOR SYSTEM",
    tagline:"MaxiGro · MaxiBloom · CALiMAGic",
    desc:"Professional 2-part dry concentrate system with full strength tiers for indoor grows.",
    stages:["early_growth","late_growth","early_flower","peak_flower","late_flower"],
    includedKeys:["mx_gro","mx_bloom_p","mx_calmag"],
  },
  "maxi_outdoor": {
    id:"maxi_outdoor", name:"MaxiSeries Outdoor", parts:"1", color:"#558B2F", isPowder:true,
    baseLabel:"MAXI SERIES 1-PART OUTDOOR SYSTEM",
    tagline:"MaxiGro · MaxiBloom",
    desc:"Simple 1-part dry concentrate system designed for outdoor growing conditions.",
    stages:["early_growth","early_flower"],
    includedKeys:["mx_gro","mx_bloom_p"],
  },
  "floranvoa_1part": {
    id:"floranvoa_1part", name:"FloraNova 1-Part", parts:"1", color:"#6A1B9A", isPowder:true,
    baseLabel:"FLORANOVA 1-PART NUTRIENT SYSTEM",
    tagline:"FloraNova Grow · FloraNova Bloom",
    desc:"Breakthrough liquid formula with dry-concentrate strength. One product per stage — simple and powerful.",
    stages:["early_growth","late_growth","early_flower","peak_flower","late_flower"],
    includedKeys:["fn_grow","fn_bloom"],
  },
  "floranvoa_4part": {
    id:"floranvoa_4part", name:"FloraNova 4-Part", parts:"4", color:"#AD1457", isPowder:true,
    baseLabel:"FLORANOVA 4-PART NUTRIENT SYSTEM",
    tagline:"FloraNova Grow · Bloom + CALiMAGic · Floralicious Plus · Liquid KoolBloom",
    desc:"FloraNova base with Pro Performance Pack for enhanced Ca/Mg, plant vitality, and bloom production.",
    stages:["early_growth","late_growth","early_flower","peak_flower","late_flower"],
    includedKeys:["fn_grow","fn_bloom","calimagic","floralicious","koolbloom"],
  },
  "floranvoa_8part": {
    id:"floranvoa_8part", name:"FloraNova 8-Part", parts:"8", color:"#00838F", isPowder:true,
    baseLabel:"FLORANOVA 8-PART NUTRIENT SYSTEM",
    tagline:"FloraNova + Pro Performance Pack + RapidStart · Ripen · Armor Si · FloraKleen",
    desc:"Full custom performance system with root stimulation, ripening agents, and silica for maximum yield.",
    stages:["early_growth","late_growth","early_flower","peak_flower","late_flower","flush"],
    includedKeys:["fn_grow","fn_bloom","calimagic","floralicious","koolbloom","rapidstart","ripen_p","armorsi","florakleen"],
  },
};

const SYSTEM_EXCLUDED_SUPPS = {
  "3part": [],
  "6part": ["calimagic","botanicare_calmag","koolbloom_liquid"],
  "10part": ["calimagic","botanicare_calmag","koolbloom_liquid","armor_si"],
  "florapro_std":    [],
  "florapro_highec": [],
  "biothrive_basic":  [],
  "biothrive_custom": [],
  "maxi_indoor":  [],
  "maxi_outdoor": [],
  "floranvoa_1part": [],
  "floranvoa_4part": ["calimagic","botanicare_calmag","koolbloom_liquid"],
  "floranvoa_8part": ["calimagic","botanicare_calmag","koolbloom_liquid","armor_si"],
};

const SCHEDULES = {
  "3part": {
    seedling:     { light:{micro:1.3,gro:1.3,bloom:0},   medium:{micro:1.3,gro:1.3,bloom:0},   aggressive:{micro:1.3,gro:1.3,bloom:0},   seedlingFixed:true },
    early_growth: { light:{micro:3.6,gro:3.4,bloom:2.6}, medium:{micro:4.2,gro:3.8,bloom:3.0}, aggressive:{micro:5.2,gro:4.8,bloom:3.7} },
    late_growth:  { light:{micro:6.0,gro:5.6,bloom:4.2}, medium:{micro:6.8,gro:6.4,bloom:4.8}, aggressive:{micro:8.5,gro:8.0,bloom:6.0} },
    early_flower: { light:{micro:5.3,gro:4.7,bloom:6.1}, medium:{micro:6.1,gro:5.3,bloom:6.6}, aggressive:{micro:7.6,gro:6.6,bloom:8.5} },
    peak_flower:  { light:{micro:5.0,gro:4.7,bloom:6.4}, medium:{micro:5.7,gro:5.3,bloom:7.1}, aggressive:{micro:7.1,gro:6.6,bloom:9.0} },
    late_flower:  { light:{micro:4.7,gro:4.7,bloom:6.6}, medium:{micro:5.3,gro:5.3,bloom:7.6}, aggressive:{micro:6.6,gro:6.6,bloom:9.5} },
    flush:        { light:{micro:0,gro:0,bloom:0},        medium:{micro:0,gro:0,bloom:0},        aggressive:{micro:0,gro:0,bloom:0},        isFlush:true },
  },
  "6part": {
    early_growth:  { light:{micro:2.8,gro:3.8,bloom:1.9,calimagic:1.9,floralicious:1.0,koolbloom:0},    medium:{micro:2.8,gro:4.7,bloom:2.3,calimagic:1.9,floralicious:1.0,koolbloom:0},    aggressive:{micro:3.8,gro:5.7,bloom:2.8,calimagic:2.0,floralicious:1.0,koolbloom:0} },
    late_growth:   { light:{micro:4.7,gro:5.7,bloom:3.8,calimagic:1.9,floralicious:1.0,koolbloom:0},    medium:{micro:5.7,gro:6.6,bloom:4.2,calimagic:1.9,floralicious:1.5,koolbloom:0},    aggressive:{micro:7.6,gro:8.5,bloom:4.7,calimagic:2.0,floralicious:2.0,koolbloom:0} },
    early_flower:  { light:{micro:3.8,gro:4.7,bloom:4.7,calimagic:1.9,floralicious:1.0,koolbloom:1.0},  medium:{micro:3.8,gro:5.7,bloom:5.7,calimagic:1.9,floralicious:1.5,koolbloom:1.0},  aggressive:{micro:5.7,gro:6.6,bloom:6.6,calimagic:2.0,floralicious:2.0,koolbloom:1.0} },
    peak_flower:   { light:{micro:3.8,gro:3.5,bloom:5.2,calimagic:1.9,floralicious:1.0,koolbloom:1.5},  medium:{micro:3.1,gro:3.1,bloom:6.1,calimagic:1.9,floralicious:1.5,koolbloom:1.9},  aggressive:{micro:5.0,gro:4.0,bloom:7.5,calimagic:2.0,floralicious:2.0,koolbloom:2.0} },
    late_flower:  { light:{micro:3.8,gro:2.8,bloom:5.7,calimagic:1.9,floralicious:1.0,koolbloom:1.8},  medium:{micro:2.8,gro:2.8,bloom:6.6,calimagic:1.9,floralicious:1.5,koolbloom:1.9},  aggressive:{micro:4.7,gro:3.8,bloom:8.5,calimagic:2.0,floralicious:2.0,koolbloom:2.0} },
    flush:         { light:{micro:0,gro:0,bloom:0,calimagic:0,floralicious:0,koolbloom:0}, medium:{micro:0,gro:0,bloom:0,calimagic:0,floralicious:0,koolbloom:0}, aggressive:{micro:0,gro:0,bloom:0,calimagic:0,floralicious:0,koolbloom:0}, isFlush:true },
  },
  "10part": {
    early_growth:  { light:{micro:2.8,gro:3.8,bloom:1.9,calimagic:1.8,floralicious:1.0,koolbloom:0,rapidstart:1.0,ripen_p:0,armorsi:2.5,florakleen:0},  medium:{micro:2.8,gro:4.7,bloom:2.3,calimagic:1.9,floralicious:1.0,koolbloom:0,rapidstart:1.0,ripen_p:0,armorsi:2.5,florakleen:0},  aggressive:{micro:3.8,gro:5.7,bloom:2.8,calimagic:2.0,floralicious:1.0,koolbloom:0,rapidstart:1.0,ripen_p:0,armorsi:2.5,florakleen:0} },
    late_growth:   { light:{micro:4.7,gro:5.7,bloom:3.8,calimagic:1.8,floralicious:1.0,koolbloom:0,rapidstart:1.0,ripen_p:0,armorsi:2.5,florakleen:0},  medium:{micro:5.7,gro:6.6,bloom:3.8,calimagic:1.9,floralicious:1.5,koolbloom:0,rapidstart:1.0,ripen_p:0,armorsi:2.5,florakleen:0},  aggressive:{micro:7.6,gro:8.5,bloom:4.7,calimagic:2.0,floralicious:2.0,koolbloom:0,rapidstart:1.0,ripen_p:0,armorsi:2.5,florakleen:0} },
    early_flower: { light:{micro:3.8,gro:3.8,bloom:5.7,calimagic:1.8,floralicious:1.0,koolbloom:1.0,rapidstart:1.0,ripen_p:0,armorsi:0,florakleen:0},  medium:{micro:4.7,gro:3.8,bloom:6.6,calimagic:1.9,floralicious:1.5,koolbloom:1.0,rapidstart:1.0,ripen_p:0,armorsi:0,florakleen:0},  aggressive:{micro:5.7,gro:4.7,bloom:8.5,calimagic:2.0,floralicious:2.0,koolbloom:1.0,rapidstart:1.0,ripen_p:0,armorsi:0,florakleen:0} },
    peak_flower:  { light:{micro:2.8,gro:3.8,bloom:5.7,calimagic:1.8,floralicious:1.0,koolbloom:1.8,rapidstart:0,ripen_p:0,armorsi:0,florakleen:0},    medium:{micro:2.8,gro:4.7,bloom:6.1,calimagic:1.9,floralicious:1.5,koolbloom:1.9,rapidstart:0,ripen_p:0,armorsi:0,florakleen:0},    aggressive:{micro:3.8,gro:5.7,bloom:7.6,calimagic:2.0,floralicious:2.0,koolbloom:2.0,rapidstart:0,ripen_p:0,armorsi:0,florakleen:0} },
    late_flower:  { light:{micro:2.7,gro:2.0,bloom:2.7,calimagic:1.0,floralicious:1.0,koolbloom:0,rapidstart:0,ripen_p:4.0,armorsi:2.5,florakleen:0},   medium:{micro:2.8,gro:2.3,bloom:2.8,calimagic:1.0,floralicious:1.0,koolbloom:0,rapidstart:0,ripen_p:4.0,armorsi:2.5,florakleen:0},   aggressive:{micro:3.8,gro:2.8,bloom:3.8,calimagic:1.0,floralicious:1.0,koolbloom:0,rapidstart:0,ripen_p:4.0,armorsi:2.5,florakleen:0} },
    flush:         { light:{micro:0,gro:0,bloom:0,calimagic:0,floralicious:0,koolbloom:0,rapidstart:0,ripen_p:0,armorsi:0,florakleen:10.0}, medium:{micro:0,gro:0,bloom:0,calimagic:0,floralicious:0,koolbloom:0,rapidstart:0,ripen_p:0,armorsi:0,florakleen:10.0}, aggressive:{micro:0,gro:0,bloom:0,calimagic:0,floralicious:0,koolbloom:0,rapidstart:0,ripen_p:0,armorsi:0,florakleen:10.0}, isFlush:true },
  },
  // ── FloraPro Powder Standard ─────────────────────────────────────────────
  // Doses = ml/gal of 1 lb/gal concentrated stock solution. No strength tiers.
  "florapro_std": {
    seedling:     { light:{micro:0,gro:0,bloom:0,fp_ca_micros:7.0,fp_grow:9.0,fp_bloom:0,fp_late_bloom:0},     medium:{micro:0,gro:0,bloom:0,fp_ca_micros:7.0,fp_grow:9.0,fp_bloom:0,fp_late_bloom:0},     aggressive:{micro:0,gro:0,bloom:0,fp_ca_micros:7.0,fp_grow:9.0,fp_bloom:0,fp_late_bloom:0} },
    early_growth: { light:{micro:0,gro:0,bloom:0,fp_ca_micros:30.0,fp_grow:35.0,fp_bloom:0,fp_late_bloom:0},   medium:{micro:0,gro:0,bloom:0,fp_ca_micros:30.0,fp_grow:35.0,fp_bloom:0,fp_late_bloom:0},   aggressive:{micro:0,gro:0,bloom:0,fp_ca_micros:30.0,fp_grow:35.0,fp_bloom:0,fp_late_bloom:0} },
    late_growth:  { light:{micro:0,gro:0,bloom:0,fp_ca_micros:30.0,fp_grow:35.0,fp_bloom:0,fp_late_bloom:0},   medium:{micro:0,gro:0,bloom:0,fp_ca_micros:30.0,fp_grow:35.0,fp_bloom:0,fp_late_bloom:0},   aggressive:{micro:0,gro:0,bloom:0,fp_ca_micros:30.0,fp_grow:35.0,fp_bloom:0,fp_late_bloom:0} },
    early_flower: { light:{micro:0,gro:0,bloom:0,fp_ca_micros:30.0,fp_grow:0,fp_bloom:31.5,fp_late_bloom:8.0},  medium:{micro:0,gro:0,bloom:0,fp_ca_micros:30.0,fp_grow:0,fp_bloom:31.5,fp_late_bloom:8.0},  aggressive:{micro:0,gro:0,bloom:0,fp_ca_micros:30.0,fp_grow:0,fp_bloom:31.5,fp_late_bloom:8.0} },
    peak_flower:  { light:{micro:0,gro:0,bloom:0,fp_ca_micros:26.5,fp_grow:0,fp_bloom:27.5,fp_late_bloom:14.0}, medium:{micro:0,gro:0,bloom:0,fp_ca_micros:26.5,fp_grow:0,fp_bloom:27.5,fp_late_bloom:14.0}, aggressive:{micro:0,gro:0,bloom:0,fp_ca_micros:26.5,fp_grow:0,fp_bloom:27.5,fp_late_bloom:14.0} },
    late_flower:  { light:{micro:0,gro:0,bloom:0,fp_ca_micros:18.5,fp_grow:0,fp_bloom:15.5,fp_late_bloom:24.0}, medium:{micro:0,gro:0,bloom:0,fp_ca_micros:18.5,fp_grow:0,fp_bloom:15.5,fp_late_bloom:24.0}, aggressive:{micro:0,gro:0,bloom:0,fp_ca_micros:18.5,fp_grow:0,fp_bloom:15.5,fp_late_bloom:24.0} },
    flush:        { light:{micro:0,gro:0,bloom:0,fp_ca_micros:12.5,fp_grow:0,fp_bloom:0,fp_late_bloom:29.0},    medium:{micro:0,gro:0,bloom:0,fp_ca_micros:12.5,fp_grow:0,fp_bloom:0,fp_late_bloom:29.0},    aggressive:{micro:0,gro:0,bloom:0,fp_ca_micros:12.5,fp_grow:0,fp_bloom:0,fp_late_bloom:29.0},    isFlush:true },
  },
  // ── FloraPro Powder High EC ──────────────────────────────────────────────
  "florapro_highec": {
    seedling:     { light:{micro:0,gro:0,bloom:0,fp_ca_micros:7.0,fp_grow:9.0,fp_bloom:0,fp_late_bloom:0},     medium:{micro:0,gro:0,bloom:0,fp_ca_micros:7.0,fp_grow:9.0,fp_bloom:0,fp_late_bloom:0},     aggressive:{micro:0,gro:0,bloom:0,fp_ca_micros:7.0,fp_grow:9.0,fp_bloom:0,fp_late_bloom:0} },
    early_growth: { light:{micro:0,gro:0,bloom:0,fp_ca_micros:31.0,fp_grow:38.0,fp_bloom:0,fp_late_bloom:0},   medium:{micro:0,gro:0,bloom:0,fp_ca_micros:31.0,fp_grow:38.0,fp_bloom:0,fp_late_bloom:0},   aggressive:{micro:0,gro:0,bloom:0,fp_ca_micros:31.0,fp_grow:38.0,fp_bloom:0,fp_late_bloom:0} },
    late_growth:  { light:{micro:0,gro:0,bloom:0,fp_ca_micros:31.0,fp_grow:38.0,fp_bloom:0,fp_late_bloom:0},   medium:{micro:0,gro:0,bloom:0,fp_ca_micros:31.0,fp_grow:38.0,fp_bloom:0,fp_late_bloom:0},   aggressive:{micro:0,gro:0,bloom:0,fp_ca_micros:31.0,fp_grow:38.0,fp_bloom:0,fp_late_bloom:0} },
    early_flower: { light:{micro:0,gro:0,bloom:0,fp_ca_micros:30.0,fp_grow:0,fp_bloom:33.0,fp_late_bloom:12.5}, medium:{micro:0,gro:0,bloom:0,fp_ca_micros:30.0,fp_grow:0,fp_bloom:33.0,fp_late_bloom:12.5}, aggressive:{micro:0,gro:0,bloom:0,fp_ca_micros:30.0,fp_grow:0,fp_bloom:33.0,fp_late_bloom:12.5} },
    peak_flower:  { light:{micro:0,gro:0,bloom:0,fp_ca_micros:28.5,fp_grow:0,fp_bloom:25.5,fp_late_bloom:21.0}, medium:{micro:0,gro:0,bloom:0,fp_ca_micros:28.5,fp_grow:0,fp_bloom:25.5,fp_late_bloom:21.0}, aggressive:{micro:0,gro:0,bloom:0,fp_ca_micros:28.5,fp_grow:0,fp_bloom:25.5,fp_late_bloom:21.0} },
    late_flower:  { light:{micro:0,gro:0,bloom:0,fp_ca_micros:19.0,fp_grow:0,fp_bloom:15.0,fp_late_bloom:26.0}, medium:{micro:0,gro:0,bloom:0,fp_ca_micros:19.0,fp_grow:0,fp_bloom:15.0,fp_late_bloom:26.0}, aggressive:{micro:0,gro:0,bloom:0,fp_ca_micros:19.0,fp_grow:0,fp_bloom:15.0,fp_late_bloom:26.0} },
    flush:        { light:{micro:0,gro:0,bloom:0,fp_ca_micros:12.5,fp_grow:0,fp_bloom:0,fp_late_bloom:32.0},    medium:{micro:0,gro:0,bloom:0,fp_ca_micros:12.5,fp_grow:0,fp_bloom:0,fp_late_bloom:32.0},    aggressive:{micro:0,gro:0,bloom:0,fp_ca_micros:12.5,fp_grow:0,fp_bloom:0,fp_late_bloom:32.0},    isFlush:true },
  },
  // ── BioThrive Basic (2-Part) ──────────────────────────────────────────────
  // Grow/Bloom in grams/gal. CaMg+ in ml/gal. Source: GH Weekly Feedchart.
  "biothrive_basic": {
    early_growth: { light:{micro:0,gro:0,bloom:0,bt_grow:5.5,bt_bloom_p:0,bt_camg:2.0},  medium:{micro:0,gro:0,bloom:0,bt_grow:6.5,bt_bloom_p:0,bt_camg:2.5},  aggressive:{micro:0,gro:0,bloom:0,bt_grow:8.0,bt_bloom_p:0,bt_camg:3.0} },
    late_growth:  { light:{micro:0,gro:0,bloom:0,bt_grow:8.5,bt_bloom_p:0,bt_camg:3.5},  medium:{micro:0,gro:0,bloom:0,bt_grow:10.0,bt_bloom_p:0,bt_camg:4.0}, aggressive:{micro:0,gro:0,bloom:0,bt_grow:12.5,bt_bloom_p:0,bt_camg:5.0} },
    early_flower: { light:{micro:0,gro:0,bloom:0,bt_grow:0,bt_bloom_p:10.5,bt_camg:6.0}, medium:{micro:0,gro:0,bloom:0,bt_grow:0,bt_bloom_p:12.0,bt_camg:6.5}, aggressive:{micro:0,gro:0,bloom:0,bt_grow:0,bt_bloom_p:15.0,bt_camg:8.5} },
    peak_flower:  { light:{micro:0,gro:0,bloom:0,bt_grow:0,bt_bloom_p:9.5,bt_camg:5.8},  medium:{micro:0,gro:0,bloom:0,bt_grow:0,bt_bloom_p:11.0,bt_camg:6.3}, aggressive:{micro:0,gro:0,bloom:0,bt_grow:0,bt_bloom_p:14.0,bt_camg:8.0} },
    late_flower:  { light:{micro:0,gro:0,bloom:0,bt_grow:0,bt_bloom_p:8.5,bt_camg:5.2},  medium:{micro:0,gro:0,bloom:0,bt_grow:0,bt_bloom_p:10.0,bt_camg:6.0}, aggressive:{micro:0,gro:0,bloom:0,bt_grow:0,bt_bloom_p:12.5,bt_camg:7.5} },
  },
  // ── BioThrive Custom (7-Part) ─────────────────────────────────────────────
  "biothrive_custom": {
    early_growth: { light:{micro:0,gro:0,bloom:0,bt_grow:5.0,bt_bloom_p:0,bt_camg:3.5,bt_bioroot:3.5,bt_bioweed:3.5,bt_biobud:0,bt_biomarine:3.5,bt_diamond:3.5}, medium:{micro:0,gro:0,bloom:0,bt_grow:5.5,bt_bloom_p:0,bt_camg:4.0,bt_bioroot:4.0,bt_bioweed:4.0,bt_biobud:0,bt_biomarine:4.0,bt_diamond:4.0}, aggressive:{micro:0,gro:0,bloom:0,bt_grow:7.0,bt_bloom_p:0,bt_camg:5.0,bt_bioroot:5.0,bt_bioweed:5.0,bt_biobud:0,bt_biomarine:5.0,bt_diamond:5.0} },
    late_growth:  { light:{micro:0,gro:0,bloom:0,bt_grow:8.5,bt_bloom_p:0,bt_camg:5.2,bt_bioroot:3.5,bt_bioweed:3.5,bt_biobud:0,bt_biomarine:3.5,bt_diamond:3.5}, medium:{micro:0,gro:0,bloom:0,bt_grow:9.5,bt_bloom_p:0,bt_camg:6.0,bt_bioroot:4.0,bt_bioweed:4.0,bt_biobud:0,bt_biomarine:4.0,bt_diamond:4.0}, aggressive:{micro:0,gro:0,bloom:0,bt_grow:12.0,bt_bloom_p:0,bt_camg:7.5,bt_bioroot:5.0,bt_bioweed:5.0,bt_biobud:0,bt_biomarine:5.0,bt_diamond:5.0} },
    early_flower: { light:{micro:0,gro:0,bloom:0,bt_grow:0,bt_bloom_p:8.5,bt_camg:6.0,bt_bioroot:3.5,bt_bioweed:3.5,bt_biobud:2.5,bt_biomarine:3.5,bt_diamond:3.5}, medium:{micro:0,gro:0,bloom:0,bt_grow:0,bt_bloom_p:10.0,bt_camg:6.8,bt_bioroot:4.0,bt_bioweed:4.0,bt_biobud:2.5,bt_biomarine:4.0,bt_diamond:4.0}, aggressive:{micro:0,gro:0,bloom:0,bt_grow:0,bt_bloom_p:12.5,bt_camg:8.5,bt_bioroot:5.0,bt_bioweed:5.0,bt_biobud:2.5,bt_biomarine:7.5,bt_diamond:5.0} },
    peak_flower:  { light:{micro:0,gro:0,bloom:0,bt_grow:0,bt_bloom_p:7.5,bt_camg:6.3,bt_bioroot:3.5,bt_bioweed:0,bt_biobud:2.5,bt_biomarine:4.5,bt_diamond:3.5}, medium:{micro:0,gro:0,bloom:0,bt_grow:0,bt_bloom_p:8.5,bt_camg:7.0,bt_bioroot:4.0,bt_bioweed:0,bt_biobud:2.5,bt_biomarine:5.0,bt_diamond:4.0}, aggressive:{micro:0,gro:0,bloom:0,bt_grow:0,bt_bloom_p:10.5,bt_camg:8.8,bt_bioroot:5.0,bt_bioweed:0,bt_biobud:2.5,bt_biomarine:6.5,bt_diamond:5.0} },
    late_flower:  { light:{micro:0,gro:0,bloom:0,bt_grow:0,bt_bloom_p:6.0,bt_camg:6.0,bt_bioroot:3.5,bt_bioweed:0,bt_biobud:2.5,bt_biomarine:5.3,bt_diamond:3.5}, medium:{micro:0,gro:0,bloom:0,bt_grow:0,bt_bloom_p:6.8,bt_camg:6.8,bt_bioroot:4.0,bt_bioweed:0,bt_biobud:2.5,bt_biomarine:6.0,bt_diamond:4.0}, aggressive:{micro:0,gro:0,bloom:0,bt_grow:0,bt_bloom_p:8.5,bt_camg:8.5,bt_bioroot:5.0,bt_bioweed:0,bt_biobud:2.5,bt_biomarine:7.5,bt_diamond:5.0} },
  },
  // ── MaxiSeries Indoor (2-Part) ────────────────────────────────────────────
  // MaxiGro / MaxiBloom in g/gal. CALiMAGic in ml/gal. Source: GH Feedchart.
  "maxi_indoor": {
    early_growth:       { light:{micro:0,gro:0,bloom:0,mx_gro:2.7,mx_bloom_p:0,mx_calmag:1.8}, medium:{micro:0,gro:0,bloom:0,mx_gro:3.0,mx_bloom_p:0,mx_calmag:2.0}, aggressive:{micro:0,gro:0,bloom:0,mx_gro:3.8,mx_bloom_p:0,mx_calmag:2.5} },
    late_growth:        { light:{micro:0,gro:0,bloom:0,mx_gro:4.0,mx_bloom_p:0,mx_calmag:1.8}, medium:{micro:0,gro:0,bloom:0,mx_gro:4.5,mx_bloom_p:0,mx_calmag:2.0}, aggressive:{micro:0,gro:0,bloom:0,mx_gro:5.5,mx_bloom_p:0,mx_calmag:2.5} },
    early_flower: { light:{micro:0,gro:0,bloom:0,mx_gro:0,mx_bloom_p:4.0,mx_calmag:2.5}, medium:{micro:0,gro:0,bloom:0,mx_gro:0,mx_bloom_p:4.5,mx_calmag:2.8}, aggressive:{micro:0,gro:0,bloom:0,mx_gro:0,mx_bloom_p:5.7,mx_calmag:3.5} },
    peak_flower:  { light:{micro:0,gro:0,bloom:0,mx_gro:0,mx_bloom_p:4.2,mx_calmag:2.2}, medium:{micro:0,gro:0,bloom:0,mx_gro:0,mx_bloom_p:4.7,mx_calmag:2.5}, aggressive:{micro:0,gro:0,bloom:0,mx_gro:0,mx_bloom_p:5.6,mx_calmag:3.2} },
    late_flower:  { light:{micro:0,gro:0,bloom:0,mx_gro:0,mx_bloom_p:3.8,mx_calmag:1.5}, medium:{micro:0,gro:0,bloom:0,mx_gro:0,mx_bloom_p:4.5,mx_calmag:2.0}, aggressive:{micro:0,gro:0,bloom:0,mx_gro:0,mx_bloom_p:5.5,mx_calmag:2.0} },
  },
  // ── MaxiSeries Outdoor (1-Part) ────────────────────────────────────────────
  "maxi_outdoor": {
    early_growth: { light:{micro:0,gro:0,bloom:0,mx_gro:4.6,mx_bloom_p:0}, medium:{micro:0,gro:0,bloom:0,mx_gro:5.2,mx_bloom_p:0}, aggressive:{micro:0,gro:0,bloom:0,mx_gro:6.5,mx_bloom_p:0} },
    early_flower: { light:{micro:0,gro:0,bloom:0,mx_gro:0,mx_bloom_p:3.9}, medium:{micro:0,gro:0,bloom:0,mx_gro:0,mx_bloom_p:4.4}, aggressive:{micro:0,gro:0,bloom:0,mx_gro:0,mx_bloom_p:5.5} },
  },
  // ── FloraNova 1-Part ──────────────────────────────────────────────────────
  // Liquid ml/gal. Use Grow in veg, Bloom in flower — never both at once.
  "floranvoa_1part": {
    early_growth: { light:{micro:0,gro:0,bloom:0,fn_grow:3.5,fn_bloom:0}, medium:{micro:0,gro:0,bloom:0,fn_grow:4.0,fn_bloom:0}, aggressive:{micro:0,gro:0,bloom:0,fn_grow:5.0,fn_bloom:0} },
    late_growth:  { light:{micro:0,gro:0,bloom:0,fn_grow:5.3,fn_bloom:0}, medium:{micro:0,gro:0,bloom:0,fn_grow:6.0,fn_bloom:0}, aggressive:{micro:0,gro:0,bloom:0,fn_grow:7.5,fn_bloom:0} },
    early_flower: { light:{micro:0,gro:0,bloom:0,fn_grow:0,fn_bloom:5.3}, medium:{micro:0,gro:0,bloom:0,fn_grow:0,fn_bloom:6.0}, aggressive:{micro:0,gro:0,bloom:0,fn_grow:0,fn_bloom:7.5} },
    peak_flower:  { light:{micro:0,gro:0,bloom:0,fn_grow:0,fn_bloom:5.8}, medium:{micro:0,gro:0,bloom:0,fn_grow:0,fn_bloom:6.5}, aggressive:{micro:0,gro:0,bloom:0,fn_grow:0,fn_bloom:8.0} },
    late_flower:  { light:{micro:0,gro:0,bloom:0,fn_grow:0,fn_bloom:4.4}, medium:{micro:0,gro:0,bloom:0,fn_grow:0,fn_bloom:5.0}, aggressive:{micro:0,gro:0,bloom:0,fn_grow:0,fn_bloom:6.3} },
  },
  // ── FloraNova 4-Part ──────────────────────────────────────────────────────
  "floranvoa_4part": {
    early_growth: { light:{micro:0,gro:0,bloom:0,fn_grow:3.2,fn_bloom:0,calimagic:1.0,floralicious:1.0,koolbloom:0}, medium:{micro:0,gro:0,bloom:0,fn_grow:3.6,fn_bloom:0,calimagic:1.2,floralicious:1.0,koolbloom:0}, aggressive:{micro:0,gro:0,bloom:0,fn_grow:4.5,fn_bloom:0,calimagic:1.5,floralicious:1.0,koolbloom:0} },
    late_growth:  { light:{micro:0,gro:0,bloom:0,fn_grow:4.2,fn_bloom:0,calimagic:2.0,floralicious:1.0,koolbloom:0}, medium:{micro:0,gro:0,bloom:0,fn_grow:4.8,fn_bloom:0,calimagic:2.4,floralicious:1.5,koolbloom:0}, aggressive:{micro:0,gro:0,bloom:0,fn_grow:6.0,fn_bloom:0,calimagic:3.0,floralicious:2.0,koolbloom:0} },
    early_flower: { light:{micro:0,gro:0,bloom:0,fn_grow:0,fn_bloom:4.2,calimagic:1.8,floralicious:1.0,koolbloom:1.0}, medium:{micro:0,gro:0,bloom:0,fn_grow:0,fn_bloom:4.8,calimagic:2.0,floralicious:1.5,koolbloom:1.0}, aggressive:{micro:0,gro:0,bloom:0,fn_grow:0,fn_bloom:6.0,calimagic:2.5,floralicious:2.0,koolbloom:1.0} },
    peak_flower:  { light:{micro:0,gro:0,bloom:0,fn_grow:0,fn_bloom:4.5,calimagic:1.9,floralicious:1.0,koolbloom:1.3}, medium:{micro:0,gro:0,bloom:0,fn_grow:0,fn_bloom:5.1,calimagic:2.0,floralicious:1.5,koolbloom:1.5}, aggressive:{micro:0,gro:0,bloom:0,fn_grow:0,fn_bloom:6.3,calimagic:2.5,floralicious:2.0,koolbloom:2.0} },
    late_flower:  { light:{micro:0,gro:0,bloom:0,fn_grow:0,fn_bloom:3.4,calimagic:1.8,floralicious:1.0,koolbloom:1.4}, medium:{micro:0,gro:0,bloom:0,fn_grow:0,fn_bloom:3.8,calimagic:2.0,floralicious:1.5,koolbloom:1.5}, aggressive:{micro:0,gro:0,bloom:0,fn_grow:0,fn_bloom:4.8,calimagic:2.5,floralicious:2.0,koolbloom:2.0} },
  },
  // ── FloraNova 8-Part ──────────────────────────────────────────────────────
  "floranvoa_8part": {
    early_growth: { light:{micro:0,gro:0,bloom:0,fn_grow:3.2,fn_bloom:0,calimagic:1.0,floralicious:1.0,koolbloom:0,rapidstart:1.0,ripen_p:0,armorsi:2.5,florakleen:0}, medium:{micro:0,gro:0,bloom:0,fn_grow:3.6,fn_bloom:0,calimagic:1.2,floralicious:1.0,koolbloom:0,rapidstart:1.0,ripen_p:0,armorsi:2.5,florakleen:0}, aggressive:{micro:0,gro:0,bloom:0,fn_grow:4.5,fn_bloom:0,calimagic:1.5,floralicious:1.0,koolbloom:0,rapidstart:1.0,ripen_p:0,armorsi:2.5,florakleen:0} },
    late_growth:  { light:{micro:0,gro:0,bloom:0,fn_grow:4.2,fn_bloom:0,calimagic:2.0,floralicious:1.0,koolbloom:0,rapidstart:1.0,ripen_p:0,armorsi:2.5,florakleen:0}, medium:{micro:0,gro:0,bloom:0,fn_grow:4.8,fn_bloom:0,calimagic:2.4,floralicious:1.5,koolbloom:0,rapidstart:1.0,ripen_p:0,armorsi:2.5,florakleen:0}, aggressive:{micro:0,gro:0,bloom:0,fn_grow:6.0,fn_bloom:0,calimagic:3.0,floralicious:2.0,koolbloom:0,rapidstart:1.0,ripen_p:0,armorsi:2.5,florakleen:0} },
    early_flower: { light:{micro:0,gro:0,bloom:0,fn_grow:0,fn_bloom:4.6,calimagic:1.8,floralicious:1.0,koolbloom:1.0,rapidstart:1.0,ripen_p:0,armorsi:2.5,florakleen:0}, medium:{micro:0,gro:0,bloom:0,fn_grow:0,fn_bloom:5.2,calimagic:2.0,floralicious:1.5,koolbloom:1.0,rapidstart:1.0,ripen_p:0,armorsi:2.5,florakleen:0}, aggressive:{micro:0,gro:0,bloom:0,fn_grow:0,fn_bloom:6.5,calimagic:2.5,floralicious:2.0,koolbloom:1.0,rapidstart:1.0,ripen_p:0,armorsi:2.5,florakleen:0} },
    peak_flower:  { light:{micro:0,gro:0,bloom:0,fn_grow:0,fn_bloom:4.0,calimagic:1.8,floralicious:1.0,koolbloom:1.4,rapidstart:0,ripen_p:0,armorsi:2.5,florakleen:0}, medium:{micro:0,gro:0,bloom:0,fn_grow:0,fn_bloom:4.5,calimagic:2.0,floralicious:1.5,koolbloom:1.5,rapidstart:0,ripen_p:0,armorsi:2.5,florakleen:0}, aggressive:{micro:0,gro:0,bloom:0,fn_grow:0,fn_bloom:5.5,calimagic:2.5,floralicious:2.0,koolbloom:2.0,rapidstart:0,ripen_p:0,armorsi:2.5,florakleen:0} },
    late_flower:  { light:{micro:0,gro:0,bloom:0,fn_grow:0,fn_bloom:3.4,calimagic:1.8,floralicious:1.0,koolbloom:1.4,rapidstart:0,ripen_p:0,armorsi:2.5,florakleen:0}, medium:{micro:0,gro:0,bloom:0,fn_grow:0,fn_bloom:3.8,calimagic:2.0,floralicious:1.5,koolbloom:1.5,rapidstart:0,ripen_p:0,armorsi:2.5,florakleen:0}, aggressive:{micro:0,gro:0,bloom:0,fn_grow:0,fn_bloom:4.8,calimagic:2.5,floralicious:2.0,koolbloom:2.0,rapidstart:0,ripen_p:0,armorsi:2.5,florakleen:0} },
    flush:        { light:{micro:0,gro:0,bloom:0,fn_grow:0,fn_bloom:0,calimagic:0,floralicious:0,koolbloom:0,rapidstart:0,ripen_p:0,armorsi:0,florakleen:10.0}, medium:{micro:0,gro:0,bloom:0,fn_grow:0,fn_bloom:0,calimagic:0,floralicious:0,koolbloom:0,rapidstart:0,ripen_p:0,armorsi:0,florakleen:10.0}, aggressive:{micro:0,gro:0,bloom:0,fn_grow:0,fn_bloom:0,calimagic:0,floralicious:0,koolbloom:0,rapidstart:0,ripen_p:0,armorsi:0,florakleen:10.0}, isFlush:true },
  },
};

const EC_RANGES = {
  "3part": {
    seedling:      { light:[0.4,0.6],  medium:[0.4,0.6],  aggressive:[0.4,0.6]  },
    early_growth:  { light:[0.9,1.1],  medium:[1.0,1.2],  aggressive:[1.3,1.5]  },
    late_growth:   { light:[1.4,1.7],  medium:[1.6,2.0],  aggressive:[2.0,2.5]  },
    early_flower: { light:[1.4,1.7],  medium:[1.6,1.9],  aggressive:[2.0,2.4]  },
    peak_flower:  { light:[1.5,1.8],  medium:[1.7,2.0],  aggressive:[2.1,2.5]  },
    late_flower:  { light:[1.4,1.7],  medium:[1.6,1.9],  aggressive:[1.9,2.4]  },
    flush:         { light:[0.0,0.3],  medium:[0.0,0.3],  aggressive:[0.0,0.3]  },
  },
  "6part": {
    early_growth:  { light:[1.0,1.2],  medium:[1.1,1.3],  aggressive:[1.3,1.6]  },
    late_growth:   { light:[1.5,1.8],  medium:[1.7,2.1],  aggressive:[2.1,2.5]  },
    early_flower: { light:[1.5,1.8],  medium:[1.6,2.0],  aggressive:[2.0,2.4]  },
    peak_flower:  { light:[1.6,1.9],  medium:[1.8,2.2],  aggressive:[2.1,2.6]  },
    late_flower:  { light:[1.5,1.8],  medium:[1.6,2.0],  aggressive:[1.9,2.4]  },
    flush:         { light:[0.0,0.3],  medium:[0.0,0.3],  aggressive:[0.0,0.3]  },
  },
  "10part": {
    early_growth:  { light:[1.0,1.2],  medium:[1.1,1.3],  aggressive:[1.3,1.6]  },
    late_growth:   { light:[1.5,1.8],  medium:[1.7,2.1],  aggressive:[2.1,2.5]  },
    early_flower: { light:[1.5,1.9],  medium:[1.7,2.0],  aggressive:[2.0,2.5]  },
    peak_flower:  { light:[1.4,1.8],  medium:[1.6,2.0],  aggressive:[1.9,2.3]  },
    late_flower:  { light:[1.1,1.4],  medium:[1.3,1.6],  aggressive:[1.5,1.8]  },
    flush:         { light:[0.0,0.3],  medium:[0.0,0.3],  aggressive:[0.0,0.3]  },
  },
  "florapro_std": {
    seedling:     { light:[0.6,0.8],  medium:[0.6,0.8],  aggressive:[0.6,0.8]  },
    early_growth: { light:[2.3,2.5],  medium:[2.3,2.5],  aggressive:[2.3,2.5]  },
    late_growth:  { light:[2.3,2.5],  medium:[2.3,2.5],  aggressive:[2.3,2.5]  },
    early_flower: { light:[2.4,2.6],  medium:[2.4,2.6],  aggressive:[2.4,2.6]  },
    peak_flower:  { light:[2.2,2.4],  medium:[2.2,2.4],  aggressive:[2.2,2.4]  },
    late_flower:  { light:[1.9,2.1],  medium:[1.9,2.1],  aggressive:[1.9,2.1]  },
    flush:        { light:[1.3,1.5],  medium:[1.3,1.5],  aggressive:[1.3,1.5]  },
  },
  "florapro_highec": {
    seedling:     { light:[0.6,0.8],  medium:[0.6,0.8],  aggressive:[0.6,0.8]  },
    early_growth: { light:[2.5,2.7],  medium:[2.5,2.7],  aggressive:[2.5,2.7]  },
    late_growth:  { light:[2.5,2.7],  medium:[2.5,2.7],  aggressive:[2.5,2.7]  },
    early_flower: { light:[2.6,2.8],  medium:[2.6,2.8],  aggressive:[2.6,2.8]  },
    peak_flower:  { light:[2.4,2.6],  medium:[2.4,2.6],  aggressive:[2.4,2.6]  },
    late_flower:  { light:[1.9,2.1],  medium:[1.9,2.1],  aggressive:[1.9,2.1]  },
    flush:        { light:[1.5,1.7],  medium:[1.5,1.7],  aggressive:[1.5,1.7]  },
  },
  "biothrive_basic": {
    early_growth: { light:[0.4,0.6],  medium:[0.5,0.7],  aggressive:[0.6,0.8]  },
    late_growth:  { light:[0.8,1.0],  medium:[0.9,1.1],  aggressive:[1.0,1.2]  },
    early_flower: { light:[1.1,1.4],  medium:[1.2,1.5],  aggressive:[1.5,1.8]  },
    peak_flower:  { light:[1.2,1.5],  medium:[1.3,1.6],  aggressive:[1.6,1.9]  },
    late_flower:  { light:[0.9,1.1],  medium:[1.0,1.3],  aggressive:[1.2,1.5]  },
  },
  "biothrive_custom": {
    early_growth: { light:[0.6,0.8],  medium:[0.7,0.9],  aggressive:[0.8,1.0]  },
    late_growth:  { light:[1.0,1.2],  medium:[1.1,1.3],  aggressive:[1.2,1.4]  },
    early_flower: { light:[1.0,1.3],  medium:[1.2,1.5],  aggressive:[1.5,1.8]  },
    peak_flower:  { light:[1.1,1.4],  medium:[1.3,1.6],  aggressive:[1.6,1.9]  },
    late_flower:  { light:[0.9,1.2],  medium:[1.1,1.4],  aggressive:[1.4,1.7]  },
  },
  "maxi_indoor": {
    early_growth:       { light:[0.9,1.3],  medium:[1.1,1.4],  aggressive:[1.4,1.8]  },
    late_growth:        { light:[1.3,1.6],  medium:[1.5,1.8],  aggressive:[1.9,2.3]  },
    early_flower: { light:[1.4,1.7],  medium:[1.6,1.9],  aggressive:[2.2,2.6]  },
    peak_flower:  { light:[1.5,1.8],  medium:[1.7,2.0],  aggressive:[2.3,2.7]  },
    late_flower:  { light:[1.2,1.5],  medium:[1.4,1.7],  aggressive:[1.8,2.2]  },
  },
  "maxi_outdoor": {
    early_growth: { light:[1.3,1.6],  medium:[1.5,1.8],  aggressive:[1.9,2.3]  },
    early_flower: { light:[1.4,1.7],  medium:[1.6,1.9],  aggressive:[2.2,2.6]  },
  },
  "floranvoa_1part": {
    early_growth: { light:[0.9,1.2],  medium:[1.2,1.5],  aggressive:[1.5,1.8]  },
    late_growth:  { light:[1.5,1.8],  medium:[1.8,2.1],  aggressive:[2.2,2.5]  },
    early_flower: { light:[1.5,1.8],  medium:[1.8,2.1],  aggressive:[2.1,2.4]  },
    peak_flower:  { light:[1.6,1.9],  medium:[1.9,2.2],  aggressive:[2.2,2.5]  },
    late_flower:  { light:[1.2,1.5],  medium:[1.5,1.8],  aggressive:[1.8,2.1]  },
  },
  "floranvoa_4part": {
    early_growth: { light:[1.0,1.3],  medium:[1.2,1.5],  aggressive:[1.5,1.8]  },
    late_growth:  { light:[1.6,1.9],  medium:[1.8,2.1],  aggressive:[2.2,2.5]  },
    early_flower: { light:[1.6,1.9],  medium:[1.8,2.1],  aggressive:[2.2,2.5]  },
    peak_flower:  { light:[1.7,2.0],  medium:[1.9,2.2],  aggressive:[2.3,2.6]  },
    late_flower:  { light:[1.3,1.6],  medium:[1.5,1.8],  aggressive:[1.9,2.2]  },
  },
  "floranvoa_8part": {
    early_growth: { light:[1.0,1.3],  medium:[1.2,1.5],  aggressive:[1.5,1.8]  },
    late_growth:  { light:[1.6,1.9],  medium:[1.8,2.1],  aggressive:[2.2,2.5]  },
    early_flower: { light:[1.6,1.9],  medium:[1.8,2.1],  aggressive:[2.2,2.5]  },
    peak_flower:  { light:[1.7,2.0],  medium:[1.9,2.2],  aggressive:[2.3,2.6]  },
    late_flower:  { light:[1.3,1.6],  medium:[1.5,1.8],  aggressive:[1.9,2.2]  },
    flush:        { light:[0.0,0.3],  medium:[0.0,0.3],  aggressive:[0.0,0.3]  },
  },
};

const INCL_META = {
  calimagic:    { name:"CALiMAGiC",           brand:"General Hydroponics", color:"#00AEEF", icon:"💧", mixOrder:1, waterAdjust:true },
  floralicious: { name:"Floralicious Plus",   brand:"General Hydroponics", color:"#F7941D", icon:"🌼", mixOrder:5 },
  koolbloom:    { name:"Liquid KoolBloom",    brand:"General Hydroponics", color:"#e05080", icon:"🌺", mixOrder:6 },
  rapidstart:   { name:"RapidStart",          brand:"General Hydroponics", color:"#9a6ad4", icon:"🌱", mixOrder:1 },
  ripen_p:      { name:"Ripen",               brand:"General Hydroponics", color:"#c05a8a", icon:"🎯", mixOrder:7 },
  armorsi:      { name:"Armor Si",            brand:"General Hydroponics", color:"#aaa",    icon:"🪨", mixOrder:0 },
  // FloraPro Powder products
  fp_ca_micros: { name:"FloraPro Ca + Micros",brand:"General Hydroponics", color:"#8B1A2F", icon:"🧪", mixOrder:0, isPowder:true, powderNote:"Add first. Use mixing chamber before other inputs." },
  fp_grow:      { name:"FloraPro Grow",       brand:"General Hydroponics", color:"#78BE20", icon:"🌿", mixOrder:3, isPowder:true },
  fp_bloom:     { name:"FloraPro Bloom",      brand:"General Hydroponics", color:"#e05080", icon:"🌸", mixOrder:4, isPowder:true },
  fp_late_flower:{ name:"FloraPro Late Bloom", brand:"General Hydroponics", color:"#F7941D", icon:"🌺", mixOrder:5, isPowder:true },
  // BioThrive products — Grow/Bloom in g/gal, supplements in ml/gal
  bt_grow:      { name:"BioThrive Grow",      brand:"General Hydroponics", color:"#78BE20", icon:"🌿", mixOrder:2, unit:"g",  powderNote:"Granular — dissolve fully before adding other products" },
  bt_bloom_p:   { name:"BioThrive Bloom",     brand:"General Hydroponics", color:"#e05080", icon:"🌸", mixOrder:2, unit:"g",  powderNote:"Granular — dissolve fully before adding other products" },
  bt_camg:      { name:"CaMg+",               brand:"General Hydroponics", color:"#00AEEF", icon:"💧", mixOrder:1 },
  bt_bioroot:   { name:"BioRoot",             brand:"General Hydroponics", color:"#9a6ad4", icon:"🦠", mixOrder:3 },
  bt_bioweed:   { name:"BioWeed",             brand:"General Hydroponics", color:"#2E7D32", icon:"🌊", mixOrder:4 },
  bt_biobud:    { name:"BioBud",              brand:"General Hydroponics", color:"#F7941D", icon:"🌺", mixOrder:5 },
  bt_biomarine: { name:"BioMarine",           brand:"General Hydroponics", color:"#1565C0", icon:"🐟", mixOrder:6 },
  bt_diamond:   { name:"Diamond Black",       brand:"General Hydroponics", color:"#555",    icon:"💎", mixOrder:7 },
  // MaxiSeries products — Grow/Bloom in g/gal, CALiMAGic in ml/gal
  mx_gro:       { name:"MaxiGro",             brand:"General Hydroponics", color:"#2E7D32", icon:"🌿", mixOrder:2, unit:"g",  powderNote:"Dry concentrate — dissolve fully before adding MaxiBloom or CALiMAGic" },
  mx_bloom_p:   { name:"MaxiBloom",           brand:"General Hydroponics", color:"#7B4FA8", icon:"🌸", mixOrder:3, unit:"g",  powderNote:"Dry concentrate — dissolve fully before adding CALiMAGic" },
  mx_calmag:    { name:"CALiMAGic",           brand:"General Hydroponics", color:"#00AEEF", icon:"💧", mixOrder:1 },
  // FloraNova — liquid ml/gal single-part system
  fn_grow:      { name:"FloraNova Grow",       brand:"General Hydroponics", color:"#2E7D32", icon:"🌿", mixOrder:2, powderNote:"Liquid concentrate — add after any silica or cal-mag" },
  fn_bloom:     { name:"FloraNova Bloom",      brand:"General Hydroponics", color:"#6A1B9A", icon:"🌸", mixOrder:3, powderNote:"Liquid concentrate — use Grow in veg, Bloom in flower" },
  florakleen:   { name:"FloraKleen",             brand:"General Hydroponics", color:"#00AEEF", icon:"🚿", mixOrder:10, powderNote:"Flush only — dissolve in full reservoir, no other products" },
};
const INCL_EC = { calimagic:0.07, floralicious:0.03, koolbloom:0.08, rapidstart:0.02, ripen_p:0.05, armorsi:0.04, fp_ca_micros:0.0, fp_grow:0.0, fp_bloom:0.0, fp_late_bloom:0.0, bt_grow:0.0, bt_bloom_p:0.0, bt_camg:0.07, bt_bioroot:0.01, bt_bioweed:0.01, bt_biobud:0.02, bt_biomarine:0.02, bt_diamond:0.01, mx_gro:0.0, mx_bloom_p:0.0, mx_calmag:0.07, fn_grow:0.04, fn_bloom:0.04, florakleen:0.0 };
const WATER_BOOST_INCL = { calimagic:{ ro:1.25, soft:1.0, tap:0.5 } };

const DWC_EC_CEILING = 2.5;
const WATER_BASELINE_EC = { tap:0.4, soft:0.2, ro:0.0 };
const SUPP_EC_PER_ML_GAL = {
  calimagic:0.07,botanicare_calmag:0.07,armor_si:0.04,protekt:0.04,silica_blast:0.04,
  koolbloom_liquid:0.08,koolbloom_dry:0.10,bud_candy:0.05,ful_power:0.02,
  slf100:0.01,cannazym:0.02,hydroguard:0.01,mammoth_p:0.01,
  recharge:0.02,great_white:0.01,orca:0.01,tps_sulfur:0.05,
};

const STRENGTH_META = {
  light:      { label:"Light",      color:"#00AEEF", desc:"Hot/dry weather · Young plants" },
  medium:     { label:"Medium",     color:"#78BE20", desc:"Normal conditions · Established plants" },
  aggressive: { label:"Aggressive", color:"#F7941D", desc:"Cool/humid weather · Heavy feeders" },
};

const CAT_META = {
  "cal-mag":     { label:"Cal-Mag",              color:"#00AEEF", icon:"💧", order:1, desc:"Corrects calcium and magnesium deficiencies. Essential when using RO or soft water, and for heavy-fruiting crops prone to Blossom End Rot. Add before base nutrients." },
  "silica":      { label:"Silica",               color:"#999",    icon:"🪨", order:2, desc:"Strengthens cell walls, hardens stems, and improves resistance to heat, pests, and disease. Always add to reservoir first — before any other product." },
  "root":        { label:"Root Biologicals",     color:"#9a6ad4", icon:"🦠", order:3, desc:"Beneficial bacteria, fungi, and microbial inoculants that colonize the root zone, improve nutrient uptake, and protect against root pathogens. Start early and use consistently." },
  "pk-booster":  { label:"PK Boosters",          color:"#e05080", icon:"🌺", order:4, desc:"Phosphorus and potassium supplements for flowering and fruiting stages. Supports bud development, fruit swell, and resin production. Not needed during vegetative growth." },
  "fulvic-humic":{ label:"Fulvic & Humic Acids", color:"#c8922a", icon:"🪵", order:5, desc:"Natural organic acids that improve nutrient transport and chelate micronutrients. Beneficial throughout the grow at low doses." },
  "enzyme":      { label:"Enzymes",              color:"#5aaa40", icon:"⚗️", order:6, desc:"Break down dead root matter and organic debris, preventing buildup and improving oxygen levels in the root zone. Particularly valuable in DWC and recirculating systems." },
  "beneficial":  { label:"Inoculants",           color:"#78BE20", icon:"🧫", order:7, desc:"Mycorrhizal fungi and bacterial inoculants that expand effective root surface area. Apply at transplant or early growth for best results." },
  "acidic":      { label:"Sulfur",               color:"#c8b030", icon:"🔬", order:8, desc:"A macronutrient and key building block for terpenes and amino acids. Beneficial for resinous crops in bloom. Mix only after base nutrients are fully diluted." },
};

// GH bottle colors match real product labels
const BOTTLE = {
  micro:{ accent:"#8B1A2F", label:"FloraMicro",  sub:"Foundation" },
  gro:  { accent:"#78BE20", label:"FloraGro",    sub:"Vegetative" },
  bloom:{ accent:"#e05080", label:"FloraBloom",  sub:"Flowering" },
};

const EC_COLOR = { safe:"#78BE20", caution:"#F7941D", danger:"#e05050" };

const SUPPLEMENTS = [
  { id:"calimagic",name:"CALiMAGiC",brand:"Gen. Hydroponics",category:"cal-mag",tapWaterWarning:true,waterBoost:{ro:1.25,soft:1.0,tap:0.5},mixOrder:1,conflicts:["botanicare_calmag"],
    stageRules:{seedling:{dose:{light:1.0,medium:1.0,aggressive:1.0},note:"conservative"},early_growth:{dose:{light:1.8,medium:1.9,aggressive:2.0}},late_growth:{dose:{light:1.8,medium:1.9,aggressive:2.0}},early_flower:{dose:{light:1.8,medium:1.9,aggressive:2.0}},peak_flower:{dose:{light:1.5,medium:1.6,aggressive:1.8}},late_flower:{dose:{light:1.0,medium:1.0,aggressive:1.0},note:"taper"}} },
  { id:"botanicare_calmag",name:"Cal-Mag Plus",brand:"Botanicare",category:"cal-mag",tapWaterWarning:true,waterBoost:{ro:1.25,soft:1.0,tap:0.5},mixOrder:1,conflicts:["calimagic"],
    stageRules:{seedling:{dose:1.0,note:"conservative"},early_growth:{dose:2.5},late_growth:{dose:4.0},early_flower:{dose:4.0},peak_flower:{dose:3.0},late_flower:{dose:1.5,note:"taper"}} },
  { id:"armor_si",name:"Armor Si",brand:"Gen. Hydroponics",category:"silica",waterBoost:{ro:1.0,soft:1.0,tap:1.0},mixOrder:0,conflicts:["protekt","silica_blast"],
    stageRules:{seedling:{dose:1.25,note:"half strength"},early_growth:{dose:2.5},late_growth:{dose:2.5},early_flower:{dose:2.5},peak_flower:{dose:2.5},late_flower:{dose:2.5}} },
  { id:"protekt",name:"Pro-Tekt",brand:"Dyna-Gro",category:"silica",waterBoost:{ro:1.0,soft:1.0,tap:1.0},mixOrder:0,conflicts:["armor_si","silica_blast"],
    stageRules:{seedling:{dose:1.0},early_growth:{dose:2.0},late_growth:{dose:2.0},early_flower:{dose:2.0},peak_flower:{dose:2.0},late_flower:{dose:2.0}} },
  { id:"silica_blast",name:"Silica Blast",brand:"Botanicare",category:"silica",waterBoost:{ro:1.0,soft:1.0,tap:1.0},mixOrder:0,conflicts:["armor_si","protekt"],
    stageRules:{seedling:{dose:1.0},early_growth:{dose:2.5},late_growth:{dose:5.0},early_flower:{dose:2.5,note:"reduce at bloom"},peak_flower:{dose:2.5},late_flower:{dose:2.5}} },
  { id:"hydroguard",name:"Hydroguard",brand:"Botanicare",category:"root",waterBoost:{ro:1.0,soft:1.0,tap:1.0},mixOrder:8,conflicts:[],
    stageRules:{seedling:{dose:2.0,note:"start early"},early_growth:{dose:2.0},late_growth:{dose:2.0},early_flower:{dose:2.0},peak_flower:{dose:2.0},late_flower:{dose:2.0}} },
  { id:"mammoth_p",name:"Mammoth P",brand:"Growcentia",category:"root",waterBoost:{ro:1.0,soft:1.0,tap:1.0},mixOrder:8,conflicts:[],
    stageRules:{early_growth:{dose:0.5},late_growth:{dose:0.5},early_flower:{dose:1.0,note:"increase at flip"},peak_flower:{dose:1.0},late_flower:{dose:0.5}} },
  { id:"koolbloom_liquid",name:"Liquid KoolBloom",brand:"Gen. Hydroponics",category:"pk-booster",waterBoost:{ro:1.0,soft:1.0,tap:1.0},mixOrder:6,conflicts:["koolbloom_dry"],
    stageRules:{early_flower:{dose:{light:1.0,medium:1.0,aggressive:1.0}},peak_flower:{dose:{light:1.5,medium:1.9,aggressive:2.0},note:"peak PK demand"},late_flower:{dose:{light:1.0,medium:1.5,aggressive:1.5}}} },
  { id:"koolbloom_dry",name:"KoolBloom Dry",brand:"Gen. Hydroponics",category:"pk-booster",waterBoost:{ro:1.0,soft:1.0,tap:1.0},mixOrder:6,conflicts:["koolbloom_liquid"],unit:"g",
    stageRules:{peak_flower:{dose:1.5,note:"ramp up"},late_flower:{dose:2.0,note:"final 1-2 weeks"}} },
  { id:"bud_candy",name:"Bud Candy",brand:"Adv. Nutrients",category:"pk-booster",waterBoost:{ro:1.0,soft:1.0,tap:1.0},mixOrder:6,conflicts:[],
    stageRules:{early_flower:{dose:4.0},peak_flower:{dose:4.0},late_flower:{dose:4.0}} },
  { id:"ful_power",name:"Ful-Power",brand:"BioAg",category:"fulvic-humic",waterBoost:{ro:1.0,soft:1.0,tap:1.0},mixOrder:5,conflicts:[],
    stageRules:{seedling:{dose:1.0,note:"dilute well"},early_growth:{dose:2.5},late_growth:{dose:2.5},early_flower:{dose:2.5},peak_flower:{dose:1.5},late_flower:{dose:1.0}} },
  { id:"slf100",name:"SLF-100",brand:"Organitek",category:"enzyme",waterBoost:{ro:1.0,soft:1.0,tap:1.0},mixOrder:8,conflicts:["cannazym"],
    stageRules:{seedling:{dose:1.0},early_growth:{dose:2.0},late_growth:{dose:2.0},early_flower:{dose:2.0},peak_flower:{dose:2.0},late_flower:{dose:2.0}} },
  { id:"cannazym",name:"Cannazym",brand:"Canna",category:"enzyme",waterBoost:{ro:1.0,soft:1.0,tap:1.0},mixOrder:8,conflicts:["slf100"],
    stageRules:{seedling:{dose:2.5},early_growth:{dose:5.0},late_growth:{dose:5.0},early_flower:{dose:5.0},peak_flower:{dose:5.0},late_flower:{dose:5.0}} },
  { id:"recharge",name:"Recharge",brand:"Real Growers",category:"beneficial",waterBoost:{ro:1.0,soft:1.0,tap:1.0},mixOrder:9,unit:"g",conflicts:["great_white","orca"],
    stageRules:{seedling:{dose:0.5},early_growth:{dose:1.0},late_growth:{dose:1.0},early_flower:{dose:1.0},peak_flower:{dose:1.0},late_flower:{dose:0.5}} },
  { id:"great_white",name:"Great White",brand:"Plant Success",category:"beneficial",waterBoost:{ro:1.0,soft:1.0,tap:1.0},mixOrder:9,unit:"g",conflicts:["recharge","orca"],
    stageRules:{seedling:{dose:0.5,note:"at transplant"},early_growth:{dose:0.5},late_growth:{dose:0.5},early_flower:{dose:0.25,note:"reduce in flower"},peak_flower:{dose:0.25},late_flower:{dose:0.25}} },
  { id:"orca",name:"Orca",brand:"Plant Success",category:"beneficial",waterBoost:{ro:1.0,soft:1.0,tap:1.0},mixOrder:9,conflicts:["recharge","great_white"],
    stageRules:{seedling:{dose:1.0},early_growth:{dose:1.0},late_growth:{dose:2.0},early_flower:{dose:2.0},peak_flower:{dose:1.0},late_flower:{dose:0.5}} },
  { id:"tps_sulfur",name:"TPS Sulfur",brand:"TPS Nutrients",category:"acidic",waterBoost:{ro:1.0,soft:1.0,tap:1.0},mixOrder:7,conflicts:[],precipitationWarning:true,
    stageRules:{seedling:{dose:0.5,note:"very dilute"},early_growth:{dose:1.0},late_growth:{dose:1.0},early_flower:{dose:1.0},peak_flower:{dose:0.75,note:"begin taper"},late_flower:{dose:0.25,note:"reduce late flower"}} },
];

// ─── LOGIC ───────────────────────────────────────────────────────────────────
// Cal-Mag scales by substrate differently than base nutrients:
// coco/inert binds calcium so it keeps the FULL dose; pre-amended potting
// mixes (dolomite lime) and mineral-rich ground soil need far less.
const CALMAG_SUBSTRATE_MULT={hydro:1.0,inert:1.0,potting:0.5,soil:0.35};
const CALMAG_INCL_KEYS=new Set(["calimagic","mx_calmag","bt_camg"]);

function resolveSupplementDose(supp,stageId,gallons,waterType,feedStrength,substrate){
  const rule=supp.stageRules[stageId];if(!rule)return null;
  const base=typeof rule.dose==="object"&&"light" in rule.dose?(rule.dose[feedStrength]??rule.dose.medium):rule.dose;
  const boost=(supp.waterBoost&&supp.waterBoost[waterType])||1.0;
  const cmult=supp.category==="cal-mag"?(CALMAG_SUBSTRATE_MULT[substrate]??1.0):1.0;
  let note=rule.note||null;
  if(supp.category==="cal-mag"){
    if(substrate==="inert")note=note?note+" · full dose — coco binds Ca":"full dose — coco binds Ca";
    if(substrate==="potting")note=note?note+" · reduced — mix contains lime":"reduced — mix contains lime";
    if(substrate==="soil")note=note?note+" · reduced — soil supplies Ca/Mg":"reduced — soil supplies Ca/Mg";
  }
  return {ml:+(base*gallons*boost*cmult).toFixed(1),tsp:+(base*gallons*boost*cmult/4.92892).toFixed(2),note,unit:supp.unit||"ml"};
}

function computeCore(systemId,stageId,strength,gallons,plantId,waterType,substrate,usePlantMod=true){
  const sched=SCHEDULES[systemId]?.[stageId];if(!sched)return null;
  const s=sched[strength];if(!s)return null;
  const isPowder=SYSTEM_CONFIGS[systemId]?.isPowder;
  const mod=(usePlantMod&&!isPowder&&PLANT_MODIFIERS[plantId]?.stages?.[stageId])||null;
  const SUBSTRATE_MULT={hydro:1.0,inert:0.9,potting:0.6,soil:0.4};
  const smult=SUBSTRATE_MULT[substrate]??1.0;
  const adj=(base,key)=>base*(mod?.[key]??1.0)*smult;
  const ml=(base,key)=>+(adj(base,key)*gallons).toFixed(1);
  const tsp=m=>+(m/4.92892).toFixed(2);
  const core={micro:{ml:ml(s.micro||0,"micro"),tsp:tsp(ml(s.micro||0,"micro"))},gro:{ml:ml(s.gro||0,"gro"),tsp:tsp(ml(s.gro||0,"gro"))},bloom:{ml:ml(s.bloom||0,"bloom"),tsp:tsp(ml(s.bloom||0,"bloom"))}};
  const included={};
  const cfg=SYSTEM_CONFIGS[systemId];
  if(cfg){for(const key of cfg.includedKeys){const raw=s[key]??0;const mu=(INCL_META[key]?.unit)||"ml";if(raw<=0){included[key]={ml:0,tsp:0,unit:mu,...INCL_META[key]};continue;}const boost=WATER_BOOST_INCL[key]?.[waterType]??1.0;const km=CALMAG_INCL_KEYS.has(key)?(CALMAG_SUBSTRATE_MULT[substrate]??1.0):smult;const ml2=+(raw*gallons*boost*km).toFixed(1);included[key]={ml:ml2,tsp:+(ml2/4.92892).toFixed(2),unit:mu,...INCL_META[key]};}}
  return {core,included,isFlush:!!sched.isFlush,seedlingFixed:!!sched.seedlingFixed};
}

function getConflicts(ids){
  const a=new Set(ids),f=[];
  for(const id of ids){const s=SUPPLEMENTS.find(x=>x.id===id);if(!s)continue;for(const cid of s.conflicts){if(a.has(cid)&&!f.some(x=>(x.a===id&&x.b===cid)||(x.a===cid&&x.b===id))){const o=SUPPLEMENTS.find(x=>x.id===cid);f.push({a:id,b:cid,aName:s.name,bName:o?o.name:cid});}}}
  return f;
}

function calcEC(systemId,stageId,strength,gallons,waterType,activeSupps,includedDoses,ecCeiling,substrate){
  const range=EC_RANGES[systemId]?.[stageId]?.[strength]||[0,0];
  const SUBSTRATE_MULT={hydro:1.0,inert:0.9,potting:0.6,soil:0.4};
  const smult=SUBSTRATE_MULT[substrate]??1.0;
  // Nutrient-derived EC scales with the substrate dose reduction
  const mid=((range[0]+range[1])/2)*smult,wb=WATER_BASELINE_EC[waterType]||0;
  let se=0;
  for(const s of activeSupps){if(!s.dose||s.dose.ml<=0)continue;se+=(s.dose.ml/gallons)*(SUPP_EC_PER_ML_GAL[s.id]||0.03);}
  for(const[key,d] of Object.entries(includedDoses)){if(!d||d.ml<=0)continue;se+=(d.ml/gallons)*(INCL_EC[key]||0.03);}
  se=+se.toFixed(2);
  const est=+(mid+wb+se).toFixed(2);
  let status="safe";
  if(est>ecCeiling)status="danger";
  else if(range[1]>0&&est>range[1]*0.95)status="caution";
  return {estimated:est,chartMin:range[0],chartMax:range[1],waterBase:+wb.toFixed(2),suppEC:se,status,ceiling:ecCeiling};
}

function ecDangerText(s){
  if(s==="aggressive")return "Switch to Medium to stay within your plant's EC ceiling.";
  if(s==="medium")return "Switch to Light or disable high-salt optional supplements.";
  return "Tap water + supplements exceed safe EC. Try RO/soft water or remove high-salt supplements.";
}

function buildMixOrder(core,activeSupps,includedDoses={}){
  const steps=[];
  const push=(order,label,dose,color,note,warn,tag)=>steps.push({order,label,dose,color,note:note||null,warn:warn||null,tag:tag||null});

  // ── 1. All included system products sorted by INCL_META.mixOrder ──────────
  const inclEntries = Object.entries(includedDoses)
    .filter(([,d])=>d&&d.ml>0)
    .sort((a,b)=>(INCL_META[a[0]]?.mixOrder??99)-(INCL_META[b[0]]?.mixOrder??99));

  for(const [key,d] of inclEntries){
    const meta=INCL_META[key];
    if(!meta)continue;
    const order=meta.mixOrder??5;
    let note=meta.powderNote||null;
    if(key==="armorsi")     note="Add first — before all other products";
    if(key==="calimagic")   note="Add before base nutrients";
    if(key==="mx_calmag")   note="Add before MaxiGro/MaxiBloom";
    if(key==="bt_camg")     note="Add before BioThrive Grow or Bloom";
    if(key==="rapidstart")  note="Add before FloraMicro";
    if(key==="fp_ca_micros")note="Add first — use mixing chamber before other inputs";
    if(key==="fp_grow")     note="Add after Ca+Micros";
    if(key==="fn_grow")     note="Veg formula — use in vegetative stages only";
    if(key==="fn_bloom")    note="Bloom formula — use in flowering stages only";
    if(key==="florakleen")  note="Flush only — use alone, no other products";
    push(order,d.name,d,meta.color,note,null,"system");
  }

  // ── 2. All optional user supplements by their mixOrder (covers 0–9+) ──────
  // Split silica (0) and cal-mag (1) first so they interleave correctly with system
  activeSupps.filter(s=>s.dose?.ml>0).forEach(s=>{
    push(s.mixOrder,s.name,s.dose,CAT_META[s.category].color,null,
      s.precipitationWarning?"Add after base nutrients are fully dissolved":null);
  });

  // ── 3. Flora Series liquid base trio (liquid systems only) ─────────────────
  if(core){
    const hasSulfur=activeSupps.some(s=>s.precipitationWarning&&s.dose?.ml>0);
    if(core.micro.ml>0)push(2,"FloraMicro",{ml:core.micro.ml,tsp:core.micro.tsp,unit:"ml"},"#8B1A2F",hasSulfur?"Add first — chelates Ca²⁺ before sulfur":"First base nutrient (GH protocol)",null,"base");
    if(core.gro.ml>0)  push(3,"FloraGro",  {ml:core.gro.ml,  tsp:core.gro.tsp,  unit:"ml"},"#78BE20",null,null,"base");
    if(core.bloom.ml>0)push(4,"FloraBloom", {ml:core.bloom.ml,tsp:core.bloom.tsp,unit:"ml"},"#e05080",null,null,"base");
  }

  return steps.sort((a,b)=>a.order-b.order);
}

const PLANT_MODIFIERS = {
  tomatoes:    { ecCeiling:3.0, ecNote:"Tomatoes tolerate up to 3.0 mS/cm — heavy fruiting demands concentrated nutrition.", mods:[{bottle:"FloraMicro",dir:"↑",why:"Extra Ca prevents Blossom End Rot"},{bottle:"FloraBloom",dir:"↑",why:"Elevated K drives fruit swell and sugar loading"}], stages:{early_flower:{micro:1.05,gro:1.00,bloom:1.08},peak_flower:{micro:1.07,gro:1.00,bloom:1.12},late_flower:{micro:1.05,gro:0.92,bloom:1.08}} },
  cannabis:    { ecCeiling:2.5, ecNote:"Standard 2.5 mS/cm ceiling. N-fade in bloom is intentional for resin production.", mods:[{bottle:"FloraGro",dir:"↓",why:"N-fade — excess N suppresses terpene expression"},{bottle:"FloraBloom",dir:"↑",why:"PK push drives resin and cannabinoid production"}], stages:{early_flower:{micro:1.00,gro:0.90,bloom:1.05},peak_flower:{micro:1.00,gro:0.75,bloom:1.12},late_flower:{micro:1.00,gro:0.65,bloom:1.08}} },
  peppers:     { ecCeiling:2.8, ecNote:"Peppers tolerate up to 2.8 mS/cm with K-forward nutrition.", mods:[{bottle:"FloraGro",dir:"↓",why:"Low-N preference — high N reduces fruit set"},{bottle:"FloraBloom",dir:"↑",why:"K drives capsaicin and flavor depth"}], stages:{early_growth:{micro:1.00,gro:0.90,bloom:1.00},late_growth:{micro:1.00,gro:0.90,bloom:1.00},early_flower:{micro:1.00,gro:0.85,bloom:1.07},peak_flower:{micro:1.00,gro:0.80,bloom:1.10},late_flower:{micro:1.00,gro:0.75,bloom:1.08}} },
  cucumbers:   { ecCeiling:2.0, ecNote:"Hard 2.0 mS/cm ceiling — cucumbers suffer osmotic stress above this.", mods:[{bottle:"FloraMicro",dir:"↓",why:"Salt-sensitive — doses lightened ~8%"},{bottle:"FloraGro",dir:"↓",why:"Reduced to protect root zone"},{bottle:"FloraBloom",dir:"↓",why:"Slight reduction; K still matters for fruit"}], stages:{early_growth:{micro:0.93,gro:0.93,bloom:0.93},late_growth:{micro:0.93,gro:0.93,bloom:0.93},early_flower:{micro:0.92,gro:0.92,bloom:0.94},peak_flower:{micro:0.91,gro:0.89,bloom:0.94},late_flower:{micro:0.90,gro:0.86,bloom:0.92}} },
  lettuce:     { ecCeiling:1.6, ecNote:"Hard 1.6 mS/cm ceiling — high EC causes tip burn in leafy crops.", mods:[{bottle:"FloraMicro",dir:"↓",why:"Light feeder — tip burn risk at high EC"},{bottle:"FloraGro",dir:"↓",why:"~70% of chart; leafy crops need gentle N"},{bottle:"FloraBloom",dir:"↓",why:"Minimal bloom nutrition needed"}], stages:{seedling:{micro:0.70,gro:0.70,bloom:0.70},early_growth:{micro:0.70,gro:0.72,bloom:0.65},late_growth:{micro:0.70,gro:0.72,bloom:0.65}} },
  herbs:       { ecCeiling:1.8, ecNote:"1.8 mS/cm ceiling — excess N dilutes essential oil content.", mods:[{bottle:"FloraMicro",dir:"↓",why:"Moderate feeder; excess causes rank growth"},{bottle:"FloraGro",dir:"↓",why:"High N dilutes essential oils in basil & herbs"}], stages:{seedling:{micro:0.80,gro:0.80,bloom:0.80},early_growth:{micro:0.80,gro:0.80,bloom:0.80},late_growth:{micro:0.80,gro:0.80,bloom:0.80}} },
  strawberries:{ ecCeiling:2.2, ecNote:"2.2 mS/cm ceiling — K-forward nutrition with moderate EC.", mods:[{bottle:"FloraMicro",dir:"↑",why:"Extra Ca improves fruit firmness"},{bottle:"FloraBloom",dir:"↑",why:"K boosts Brix and shelf life"}], stages:{early_flower:{micro:1.04,gro:0.95,bloom:1.08},peak_flower:{micro:1.04,gro:0.90,bloom:1.10},late_flower:{micro:1.04,gro:0.88,bloom:1.08}} },
  roses:       { ecCeiling:2.3, ecNote:"2.3 mS/cm ceiling — moderate-heavy feeder with good EC tolerance.", mods:[{bottle:"FloraGro",dir:"↑",why:"Elevated N for strong cane development"},{bottle:"FloraBloom",dir:"↑",why:"K drives petal count and fragrance"}], stages:{early_growth:{micro:1.00,gro:1.08,bloom:1.00},late_growth:{micro:1.00,gro:1.08,bloom:1.00},early_flower:{micro:1.00,gro:1.00,bloom:1.06},peak_flower:{micro:1.00,gro:0.95,bloom:1.10},late_flower:{micro:1.00,gro:0.92,bloom:1.08}} },
  orchids:     { ecCeiling:1.0, ecNote:"Hard 1.0 mS/cm ceiling — extremely salt-sensitive. Dilute feeds only.", mods:[{bottle:"FloraMicro",dir:"↓",why:"\"Weakly, weekly\" — scaled to ~45% of chart"},{bottle:"FloraGro",dir:"↓",why:"Epiphytes adapted to nutrient-poor environments"},{bottle:"FloraBloom",dir:"↓",why:"Over-fertilization is the #1 cause of orchid death"}], stages:{seedling:{micro:0.45,gro:0.45,bloom:0.45},early_growth:{micro:0.45,gro:0.45,bloom:0.45},early_flower:{micro:0.45,gro:0.40,bloom:0.50},late_flower:{micro:0.45,gro:0.38,bloom:0.50},late_flower:{micro:0.45,gro:0.38,bloom:0.50},late_flower:{micro:0.45,gro:0.35,bloom:0.50}} },
  houseplants: { ecCeiling:1.8, ecNote:"1.8 mS/cm ceiling — slow-growing light feeders by nature.", mods:[{bottle:"FloraMicro",dir:"↓",why:"Gentle, dilute nutrition needed"},{bottle:"FloraGro",dir:"↓",why:"~65% of chart — excess causes salt buildup"}], stages:{seedling:{micro:0.65,gro:0.65,bloom:0.65},early_growth:{micro:0.65,gro:0.65,bloom:0.65},late_growth:{micro:0.65,gro:0.65,bloom:0.65}} },
};

// ─── SUPPLEMENT RECOMMENDATIONS ─────────────────────────────────────────────
// Returns { level: "recommended"|"optional"|"skip", reason: string }
// Based on plant type, growth stage, and agronomic best-practice.

const BLOOM_STAGES = new Set(["early_flower","peak_flower","late_flower"]);
const VEG_STAGES   = new Set(["seedling","early_growth","late_growth"]);
const ROOT_STAGES  = new Set(["seedling","early_growth","late_growth","early_flower"]);

// Per-plant supplement affinities
const PLANT_SUPP_PROFILE = {
  tomatoes:     { calMag:"recommended", silica:"recommended",  pk:"recommended",  root:"recommended", enzyme:"recommended", fulvic:"recommended", sulfur:"optional",      bud:"optional"     },
  cannabis:     { calMag:"recommended", silica:"recommended",  pk:"recommended",  root:"recommended", enzyme:"recommended", fulvic:"recommended", sulfur:"recommended",   bud:"recommended"  },
  peppers:      { calMag:"recommended", silica:"recommended",  pk:"recommended",  root:"recommended", enzyme:"recommended", fulvic:"recommended", sulfur:"optional",      bud:"skip"         },
  cucumbers:    { calMag:"recommended", silica:"optional",     pk:"optional",     root:"recommended", enzyme:"recommended", fulvic:"optional",    sulfur:"skip",          bud:"skip"         },
  lettuce:      { calMag:"optional",    silica:"skip",         pk:"skip",         root:"recommended", enzyme:"recommended", fulvic:"optional",    sulfur:"skip",          bud:"skip"         },
  herbs:        { calMag:"optional",    silica:"skip",         pk:"skip",         root:"recommended", enzyme:"optional",    fulvic:"optional",    sulfur:"skip",          bud:"skip"         },
  strawberries: { calMag:"recommended", silica:"optional",     pk:"recommended",  root:"recommended", enzyme:"recommended", fulvic:"recommended", sulfur:"skip",          bud:"optional"     },
  roses:        { calMag:"recommended", silica:"recommended",  pk:"recommended",  root:"recommended", enzyme:"optional",    fulvic:"optional",    sulfur:"skip",          bud:"skip"         },
  orchids:      { calMag:"skip",        silica:"skip",         pk:"optional",     root:"optional",    enzyme:"optional",    fulvic:"skip",        sulfur:"skip",          bud:"skip"         },
  houseplants:  { calMag:"skip",        silica:"skip",         pk:"skip",         root:"optional",    enzyme:"optional",    fulvic:"skip",        sulfur:"skip",          bud:"skip"         },
};

const SUPP_CATEGORY_KEY = {
  "cal-mag":     "calMag",
  "silica":      "silica",
  "pk-booster":  "pk",
  "root":        "root",
  "enzyme":      "enzyme",
  "fulvic-humic":"fulvic",
  "acidic":      "sulfur",
  "beneficial":  "root",
};

const REC_REASONS = {
  tomatoes: {
    calMag:   "Ca prevents Blossom End Rot; essential for fruiting tomatoes",
    silica:   "Strengthens cell walls, improves disease resistance",
    pk:       "K drives fruit swell and sugar loading in bloom",
    root:     "Strong root zone critical for heavy-fruiting crops",
    enzyme:   "Maintains root health and prevents organic buildup",
    fulvic:   "Improves Ca/Mg uptake — especially valuable for BER prevention",
    sulfur:   "Sulfur supports enzyme function; use cautiously",
    bud:      "Can enhance fruit quality and Brix",
  },
  cannabis: {
    calMag:   "RO growers especially — Ca/Mg deficiency is the #1 cannabis issue",
    silica:   "Hardens stems, improves heat tolerance, boosts terpene expression",
    pk:       "PK push in bloom is standard practice for resin and yield",
    root:     "Healthy root zone = bigger canopy and denser flowers",
    enzyme:   "Breaks down dead roots; critical in DWC and recirculating systems",
    fulvic:   "Enhances nutrient transport and terpene precursor availability",
    sulfur:   "Sulfur is a key terpene precursor — strongly recommended in bloom",
    bud:      "Carbohydrate feed enhances terpene production and flower density",
  },
  peppers: {
    calMag:   "Ca prevents blossom drop and improves fruit set",
    silica:   "Structural support and disease resistance in long-season crops",
    pk:       "K drives capsaicin production and fruit color",
    root:     "Deep root systems improve drought tolerance and yield",
    enzyme:   "Keeps root zone clean during long vegetative periods",
    fulvic:   "Improves micronutrient uptake; beneficial for heavy feeders",
    sulfur:   "Use with caution; peppers are somewhat sulfur-sensitive",
    bud:      "Not recommended — doesn't benefit non-resinous crops",
  },
  cucumbers: {
    calMag:   "Prevents tip burn and improves fruit firmness",
    silica:   "Some benefit; cucumbers are not heavy silica users",
    pk:       "Light PK boost in bloom can improve fruit size",
    root:     "Beneficial — cucumbers are shallow-rooted and stress-sensitive",
    enzyme:   "Keeps root zone clean; important for high-humidity crops",
    fulvic:   "Minor benefit; optional for salt-sensitive crops",
    sulfur:   "Skip — cucumbers are sensitive to sulfur buildup",
    bud:      "Skip — no benefit for cucumbers",
  },
  lettuce: {
    calMag:   "Only needed with RO water; tap usually sufficient",
    silica:   "Not needed — lettuce is a leafy crop with low silica demand",
    pk:       "Skip — flowering/fruiting boosters not appropriate",
    root:     "Beneficial at seedling and early growth for fast establishment",
    enzyme:   "Good for preventing root slime in DWC lettuce rafts",
    fulvic:   "Minor benefit for micronutrient availability",
    sulfur:   "Skip — not needed for leafy crops",
    bud:      "Skip — not a blooming crop",
  },
  herbs: {
    calMag:   "Only if using RO or very soft water",
    silica:   "Not needed — herbs are light feeders",
    pk:       "Skip — promotes flowering/bolting, reduces flavor quality",
    root:     "Beneficial at seedling for fast establishment",
    enzyme:   "Optional — helps in DWC or hydroponic herb systems",
    fulvic:   "Minor benefit; use at low dose only",
    sulfur:   "Skip — can damage delicate herbs",
    bud:      "Skip",
  },
  strawberries: {
    calMag:   "Ca is critical for fruit firmness and shelf life",
    silica:   "Moderate benefit; improves disease resistance",
    pk:       "K boost in bloom increases Brix and flavor",
    root:     "Important for establishing runners and fruit-bearing crowns",
    enzyme:   "Good for root zone health in fruiting stage",
    fulvic:   "Improves Ca uptake — supports fruit quality",
    sulfur:   "Skip — not beneficial for strawberries",
    bud:      "May improve flavor complexity; use at low dose",
  },
  roses: {
    calMag:   "Ca improves petal firmness and reduces tip burn",
    silica:   "Hardens canes and improves fungal resistance",
    pk:       "K drives bloom size, color, and fragrance",
    root:     "Important for establishing root mass before bloom",
    enzyme:   "Optional benefit in recirculating systems",
    fulvic:   "Minor benefit for ornamental crops",
    sulfur:   "Skip — not recommended for roses",
    bud:      "Skip — carb feeds don't benefit ornamental flowers",
  },
  orchids: {
    calMag:   "Skip — orchids are highly salt-sensitive; avoid Cal-Mag",
    silica:   "Skip — epiphytes have no need for silica",
    pk:       "Very light dose only; orchids prefer balanced nutrition",
    root:     "Beneficial for establishing new root tips",
    enzyme:   "Helps break down dead roots in bark media",
    fulvic:   "Skip — too aggressive for orchids",
    sulfur:   "Skip — highly damaging to orchids",
    bud:      "Skip",
  },
  houseplants: {
    calMag:   "Skip — most houseplant mixes already contain Ca/Mg",
    silica:   "Skip — slow-growing houseplants don't need silica",
    pk:       "Skip — most houseplants are not heavy bloomers",
    root:     "Optional — beneficial for establishing new transplants",
    enzyme:   "Optional — useful in soil-free media",
    fulvic:   "Skip — not needed for slow-growing houseplants",
    sulfur:   "Skip",
    bud:      "Skip",
  },
};

// Stage-level overrides on top of plant profile
const STAGE_OVERRIDES = {
  // Root products drop off in late flower
  root: {
    peak_flower:   { level:"optional", reason:"Beneficial microbes still useful; maintain if already running" },
    late_flower:   { level:"optional", reason:"Root inoculants less impactful in late flower; use if already established" },
    flush:         { level:"skip",     reason:"Flush only — no supplements" },
  },
  // PK boosters only matter in bloom
  pk: {
    seedling:      { level:"skip",     reason:"Too early — PK boosters are for flowering stages only" },
    early_growth:  { level:"skip",     reason:"Not needed in veg — can cause early lock-out" },
    late_growth:   { level:"skip",     reason:"Hold off until flip to flower" },
    flush:         { level:"skip",     reason:"Flush only" },
  },
  // Cal-Mag tapers at peak and late flower
  calMag: {
    peak_flower:   { level:"optional", reason:"Begin tapering Ca/Mg at peak flower" },
    late_flower:   { level:"optional", reason:"Taper Ca/Mg in late flower — use at reduced dose" },
    flush:         { level:"skip",     reason:"Flush only — no supplements" },
  },
  // Silica consistent through flower
  silica: {
    peak_flower:   { level:"optional", reason:"Silica still beneficial through peak flower" },
    late_flower:   { level:"optional", reason:"Can continue but not critical in late flower" },
    flush:         { level:"skip",     reason:"Flush only" },
  },
  // Enzymes always useful except flush
  enzyme: {
    flush:         { level:"skip",     reason:"Flush only" },
  },
  // Fulvic/humic less needed late
  fulvic: {
    peak_flower:   { level:"optional", reason:"Reduces benefit as flower matures; optional" },
    late_flower:   { level:"optional", reason:"Minor benefit in late flower; use at reduced dose" },
    flush:         { level:"skip",     reason:"Flush only" },
  },
  // Sulfur bloom-focus — peak is prime window
  sulfur: {
    seedling:      { level:"skip",     reason:"Too sensitive at seedling — skip" },
    peak_flower:   { level:"recommended", reason:"Peak flower is prime window for sulfur — key terpene precursor" },
    flush:         { level:"skip",     reason:"Flush only" },
  },
};

function getSuppRec(supp, plantId, stageId) {
  if(!plantId||!stageId) return null;
  const profile = PLANT_SUPP_PROFILE[plantId];
  if(!profile) return null;
  const catKey  = SUPP_CATEGORY_KEY[supp.category];
  if(!catKey)   return null;

  const plantLevel  = profile[catKey] || "optional";
  const plantReason = REC_REASONS[plantId]?.[catKey] || "";

  // Check stage override
  const stageOv = STAGE_OVERRIDES[catKey]?.[stageId];
  if(stageOv) return { level: stageOv.level, reason: stageOv.reason };

  return { level: plantLevel, reason: plantReason };
}

// ─── APP ─────────────────────────────────────────────────────────────────────
export default function FloraApp() {
  const [substrate,  setSubstrate]  = useState(null); // "hydro"|"inert"|"potting"|"soil"
  const [brand,     setBrand]     = useState(null); // "classic" | "florapro"
  const [usePlantMod, setUsePlantMod] = useState(true);
  const [system,    setSystem]    = useState(null);
  const [plant,     setPlant]     = useState(null);
  const [stage,     setStage]     = useState(null);
  const [strength,  setStrength]  = useState("medium");
  const [volume,    setVolume]    = useState(5);
  const [unit,      setUnit]      = useState("gallons");
  const [water,     setWater]     = useState("tap");
  const [supps,     setSupps]     = useState(new Set());
  const [step,      setStep]      = useState(0);
  const [openCats, setOpenCats] = useState(new Set());
  const [showMix,      setShowMix]      = useState(false);
  const [showEC,       setShowEC]       = useState(false);
  const [savedRuns,    setSavedRuns]    = useState([]);
  const [savePrompt,   setSavePrompt]   = useState(false);
  const [saveName,     setSaveName]     = useState("");
  const [saveStatus,   setSaveStatus]   = useState(null);
  const [confirmDel,   setConfirmDel]   = useState(null);
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [storageReady,  setStorageReady]   = useState(false);

  const loadRuns = async () => {
    try {
      const res=await window.storage.list("run:");const runs=[];
      for(const key of (res?.keys||[])){try{const item=await window.storage.get(key);if(item?.value)runs.push(JSON.parse(item.value));}catch{}}
      runs.sort((a,b)=>b.savedAt-a.savedAt);setSavedRuns(runs);
    } catch{setSavedRuns([]);}
    setStorageReady(true);
  };
  useEffect(()=>{loadRuns();},[]);

  const handleSave = async () => {
    const p=PLANTS.find(x=>x.id===plant),s=STAGE_META[stage];
    const name=saveName.trim()||`${p?.icon} ${p?.name} · ${s?.label} · ${volume} ${unit}`;
    const id=`run:${Date.now()}`;
    const run={id,name,system,plant,stage,strength,volume,unit,water,supps:[...supps],savedAt:Date.now()};
    try{await window.storage.set(id,JSON.stringify(run));setSaveStatus("saved");setSavePrompt(false);setSaveName("");setTimeout(()=>setSaveStatus(null),2500);loadRuns();}catch{setSaveStatus("error");}
  };
  const handleDelete = async(id)=>{try{await window.storage.delete(id);setConfirmDel(null);loadRuns();}catch{}};
  const loadRun = (run,targetStep)=>{
    const sys=run.system||"3part";
    const br=sys.startsWith("florapro")?"florapro":sys.startsWith("biothrive")?"biothrive":sys.startsWith("maxi")?"maxi":sys.startsWith("floranvoa")?"floranvoa":"classic";
    setBrand(br);setSystem(sys);setPlant(run.plant);setStage(run.stage);
    setStrength(run.strength);setVolume(run.volume);setUnit(run.unit);
    setWater(run.water);setSupps(new Set(run.supps));setStep(targetStep);
  };

  const sysCfg      = system ? SYSTEM_CONFIGS[system] : null;
  const plantObj    = PLANTS.find(p=>p.id===plant);
  const stageObj    = stage ? STAGE_META[stage] : null;
  const gallons     = unit==="gallons" ? volume : volume/3.78541;
  const plantMod    = plant&&stage ? PLANT_MODIFIERS[plant]?.stages?.[stage] : null;
  const plantEcCeil = plant ? (PLANT_MODIFIERS[plant]?.ecCeiling??DWC_EC_CEILING) : DWC_EC_CEILING;
  const plantModMeta= plant ? PLANT_MODIFIERS[plant] : null;

  const computed = useMemo(()=>{
    if(!system||!plant||!stage||volume<=0)return null;
    return computeCore(system,stage,strength,gallons,plant,water,substrate,usePlantMod);
  },[system,plant,stage,strength,volume,unit,water,substrate,usePlantMod]);

  const core=computed?.core??null,included=computed?.included??{},isFlush=computed?.isFlush??false;

  const excludedSupps = system ? new Set(SYSTEM_EXCLUDED_SUPPS[system]||[]) : new Set();
  const suppData = useMemo(()=>{
    if(!stage)return[];
    return SUPPLEMENTS.filter(s=>!excludedSupps.has(s.id)).map(s=>({...s,dose:resolveSupplementDose(s,stage,gallons,water,strength,substrate),active:supps.has(s.id)}));
  },[stage,gallons,water,supps,strength,system,substrate]);

  const conflicts   = useMemo(()=>getConflicts([...supps]),[supps]);
  const conflictIds = useMemo(()=>new Set(conflicts.flatMap(c=>[c.a,c.b])),[conflicts]);
  const ecData      = useMemo(()=>core&&stage&&system?calcEC(system,stage,strength,gallons,water,suppData.filter(s=>s.active),included,plantEcCeil,substrate):null,[core,stage,system,strength,gallons,water,suppData,included,plantEcCeil,substrate]);
  const mixSteps    = useMemo(()=>core?buildMixOrder(core,suppData.filter(s=>s.active),included):[],[core,suppData,included]);

  const toggleSupp = id=>setSupps(p=>{const n=new Set(p);n.has(id)?n.delete(id):n.add(id);return n;});
  const avail = useMemo(()=>{
    if(!plantObj||!sysCfg)return[];
    const ss=new Set(sysCfg.stages);
    return plantObj.maxStages
      .filter(s=>ss.has(s))
      .map(s=>({id:s,...STAGE_META[s]}));
  },[plantObj,sysCfg]);

  const hasResults = core&&plantObj&&stageObj;
  const steps = ["Medium","Brand","System","Plant","Stage","Settings","Supps","Results"];
  const goTo=(i)=>{
    if(i===0)setStep(0);
    else if(i===1&&substrate)setStep(1);
    else if(i===2&&brand)setStep(2);
    else if(i===3&&system)setStep(3);
    else if(i===4&&plant)setStep(4);
    else if(i===5&&stage)setStep(5);
    else if(i===6&&stage)setStep(6);
    else if(i===7&&hasResults)setStep(7);
  };

  // ── GH BRAND DESIGN TOKENS ──────────────────────────────────────────────
  const GH = {
    green:  "#78BE20",
    blue:   "#0A84FF",
    orange: "#FF9F0A",
    black:  "#ffffff",
    dark:   "#f5f5f5",
    card:   "#FFFFFF",
    border: "#E5E5EA",
    text:   "#111111",
    muted:  "#444444",
    dim:    "#777777",
  };

  const renderStep = () => {
    // ── STEP 0: SUBSTRATE / MEDIUM ──────────────────────────────────────────
    if(step===0) return (
      <div>
        <div style={sectionLabel()}>SELECT GROWING MEDIUM</div>
        <div style={{fontSize:12,color:"#444",fontFamily:"-apple-system,BlinkMacSystemFont,'SF Pro Text','Helvetica Neue',sans-serif",marginBottom:20,lineHeight:1.6}}>
          Your growing medium affects how much nutrient your plants can access. Soil buffers and holds nutrition longer — hydroponic systems require the full chart dose.
        </div>
        {[
          { value:"hydro",   icon:"💧", label:"Hydroponics",  sub:"DWC · NFT · Aeroponics · Ebb & Flow",      mult:"Full chart dose" },
          { value:"inert",   icon:"🪨", label:"Inert Medium",  sub:"Coco · Rockwool · Perlite · Clay pebbles", mult:"90% of chart dose" },
          { value:"potting", icon:"🪴", label:"Potting Soil",  sub:"Pre-amended mixes · Fox Farm · ProMix",    mult:"60% of chart dose" },
          { value:"soil",    icon:"🌍", label:"Ground Soil",   sub:"Garden beds · native soil",                mult:"40% of chart dose" },
        ].map(opt=>{
          const sel=substrate===opt.value;
          return (
            <button key={opt.value} onClick={()=>{setSubstrate(opt.value);setStep(1);}}
              style={{display:"flex",alignItems:"center",gap:16,width:"100%",marginBottom:10,padding:"18px 20px",background:sel?"rgba(120,190,32,0.09)":"#FFFFFF",border:`1px solid ${sel?"#78BE20":"#e0e0e0"}`,cursor:"pointer",textAlign:"left",transition:"all 0.15s",position:"relative"}}>
              {sel&&<div style={{position:"absolute",left:0,top:0,bottom:0,width:4,background:"#78BE20"}}/>}
              <span style={{fontSize:36,flexShrink:0}}>{opt.icon}</span>
              <div style={{flex:1,paddingLeft:sel?4:0}}>
                <div style={{fontFamily:"-apple-system,BlinkMacSystemFont,'SF Pro Display','Helvetica Neue',sans-serif",fontSize:20,fontWeight:900,color:sel?"#78BE20":"#111",textTransform:"uppercase",letterSpacing:"0.05em"}}>{opt.label}</div>
                <div style={{fontSize:11,color:"#777",fontFamily:"-apple-system,BlinkMacSystemFont,'SF Pro Text','Helvetica Neue',sans-serif",marginTop:2}}>{opt.sub}</div>
              </div>
              <div style={{textAlign:"right",flexShrink:0}}>
                <div style={{fontFamily:"-apple-system,BlinkMacSystemFont,'SF Pro Display','Helvetica Neue',sans-serif",fontSize:11,fontWeight:700,color:sel?"#78BE20":"#999",letterSpacing:"0.08em"}}>{opt.mult}</div>
              </div>
            </button>
          );
        })}
        <div style={{marginTop:24,paddingTop:20,borderTop:"1px solid #e0e0e0",textAlign:"center"}}>
          <button onClick={()=>setShowDisclaimer(true)}
            style={{background:"none",border:"1px solid #e0e0e0",color:"#777",fontFamily:"-apple-system,BlinkMacSystemFont,'SF Pro Text','Helvetica Neue',sans-serif",fontSize:12,padding:"10px 20px",cursor:"pointer",letterSpacing:"0.03em"}}>
            ⚖ Legal Disclaimer
          </button>
        </div>
      </div>
    );

    // ── STEP 1: BRAND PICKER ────────────────────────────────────────────────
    if(step===1) return (
      <div>
        {storageReady&&savedRuns.length>0&&(
          <div style={{marginBottom:32}}>
            <div style={sectionLabel("SAVED RUNS")}>SAVED RUNS</div>
            {savedRuns.map(run=>{
              const p=PLANTS.find(x=>x.id===run.plant),s=STAGE_META[run.stage],sys=SYSTEM_CONFIGS[run.system||"3part"];
              const isConf=confirmDel===run.id;
              return (
                <div key={run.id} style={{background:GH.card,borderRadius:14,border:`1px solid ${GH.border}`,marginBottom:8,overflow:"hidden"}}>
                  <div style={{display:"flex",alignItems:"center",gap:12,padding:"14px 16px"}}>
                    <span style={{fontSize:26,flexShrink:0}}>{p?.icon||"🌱"}</span>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontFamily:"-apple-system,BlinkMacSystemFont,'SF Pro Display','Helvetica Neue',sans-serif",fontSize:16,fontWeight:700,color:GH.text,textTransform:"uppercase",letterSpacing:"0.04em",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{run.name}</div>
                      <div style={{display:"flex",gap:8,marginTop:3,flexWrap:"wrap"}}>
                        {sys&&<span style={{fontSize:10,color:sys.color,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase"}}>{sys.name}</span>}
                        <span style={{fontSize:10,color:GH.dim}}>·</span>
                        <span style={{fontSize:10,color:s?.color||GH.green}}>{s?.label}</span>
                        <span style={{fontSize:10,color:GH.dim}}>·</span>
                        <span style={{fontSize:10,color:GH.muted}}>{run.volume} {run.unit}</span>
                        <span style={{fontSize:10,color:GH.dim}}>·</span>
                        <span style={{fontSize:10,color:STRENGTH_META[run.strength]?.color}}>{STRENGTH_META[run.strength]?.label}</span>
                      </div>
                    </div>
                  </div>
                  {!isConf?(
                    <div style={{display:"flex",borderTop:`1px solid ${GH.border}`}}>
                      <button onClick={()=>loadRun(run,7)} style={runBtn(GH.green)}>▶ LOAD</button>
                      <button onClick={()=>loadRun(run,5)} style={{...runBtn(GH.blue),borderLeft:`1px solid ${GH.border}`}}>✎ MODIFY</button>
                      <button onClick={()=>setConfirmDel(run.id)} style={{...runBtn("#e05050"),borderLeft:`1px solid ${GH.border}`}}>✕ DELETE</button>
                    </div>
                  ):(
                    <div style={{display:"flex",borderTop:`1px solid #3a1a1a`,background:"rgba(200,50,50,0.08)"}}>
                      <div style={{flex:1,padding:"11px 14px",fontSize:12,color:"#e89a8a",display:"flex",alignItems:"center",fontFamily:"-apple-system,BlinkMacSystemFont,'SF Pro Text','Helvetica Neue',sans-serif"}}>Delete this run?</div>
                      <button onClick={()=>handleDelete(run.id)} style={{padding:"11px 20px",background:"rgba(200,50,50,0.3)",border:"none",borderLeft:`1px solid ${GH.border}`,color:"#ff8a8a",cursor:"pointer",fontFamily:"-apple-system,BlinkMacSystemFont,'SF Pro Display','Helvetica Neue',sans-serif",fontSize:13,fontWeight:700,letterSpacing:"0.08em"}}>YES</button>
                      <button onClick={()=>setConfirmDel(null)} style={{padding:"11px 20px",background:"none",border:"none",borderLeft:`1px solid ${GH.border}`,color:GH.muted,cursor:"pointer",fontFamily:"-apple-system,BlinkMacSystemFont,'SF Pro Display','Helvetica Neue',sans-serif",fontSize:13,fontWeight:700,letterSpacing:"0.08em"}}>NO</button>
                    </div>
                  )}
                </div>
              );
            })}
            <div style={{height:1,background:`linear-gradient(90deg,transparent,${GH.border},transparent)`,margin:"24px 0"}}/>
          </div>
        )}

        <div style={sectionLabel()}>SELECT PROGRAM</div>

        {/* Classic */}
        <div style={{marginBottom:10,background:brand==="classic"?`linear-gradient(135deg,${GH.green}15,${GH.green}05)`:GH.card,border:`1px solid ${brand==="classic"?GH.green:GH.border}`,transition:"all 0.15s"}}>
          <button onClick={()=>{setBrand("classic");setSystem(null);setPlant(null);setStage(null);setSupps(new Set());setStep(2);}}
            style={{display:"flex",alignItems:"stretch",width:"100%",background:"none",border:"none",cursor:"pointer",textAlign:"left",padding:0}}>
            <div style={{width:72,background:`${GH.green}22`,borderRight:`1px solid ${GH.green}44`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",flexShrink:0,gap:3,padding:"20px 0"}}>
              <span style={{fontFamily:"-apple-system,BlinkMacSystemFont,'SF Pro Display','Helvetica Neue',sans-serif",fontSize:11,fontWeight:900,color:GH.green,letterSpacing:"0.12em"}}>FLORA</span>
              <span style={{fontFamily:"-apple-system,BlinkMacSystemFont,'SF Pro Display','Helvetica Neue',sans-serif",fontSize:11,fontWeight:900,color:GH.green,letterSpacing:"0.12em"}}>SERIES</span>
            </div>
            <div style={{flex:1,padding:"18px 20px"}}>
              <div style={{fontFamily:"-apple-system,BlinkMacSystemFont,'SF Pro Display','Helvetica Neue',sans-serif",fontSize:24,fontWeight:900,color:brand==="classic"?GH.green:GH.text,textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:4}}>Classic</div>
              <div style={{fontSize:12,color:GH.muted,fontFamily:"-apple-system,BlinkMacSystemFont,'SF Pro Text','Helvetica Neue',sans-serif",marginBottom:6}}>3-Part · 6-Part · 10-Part</div>
              <div style={{fontSize:11,color:GH.dim,fontFamily:"-apple-system,BlinkMacSystemFont,'SF Pro Text','Helvetica Neue',sans-serif"}}>Liquid concentrate systems. The foundation of Flora Series nutrition.</div>
            </div>
            {brand==="classic"&&<div style={{width:4,background:GH.green,flexShrink:0}}/>}
          </button>
          <div style={{borderTop:`1px solid ${GH.green}33`,padding:"12px 20px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:12}}>
            <div>
              <div style={{fontFamily:"-apple-system,BlinkMacSystemFont,'SF Pro Display','Helvetica Neue',sans-serif",fontSize:12,fontWeight:700,color:GH.green,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:2}}>Plant Modifiers</div>
              <div style={{fontSize:11,color:GH.dim,fontFamily:"-apple-system,BlinkMacSystemFont,'SF Pro Text','Helvetica Neue',sans-serif",lineHeight:1.4}}>Adjusts doses for your specific crop — e.g. cannabis gets more nitrogen, orchids get less.</div>
            </div>
            <button onClick={e=>{e.stopPropagation();setUsePlantMod(v=>!v);}}
              style={{flexShrink:0,width:44,height:24,borderRadius:12,background:usePlantMod?GH.green:"#ccc",border:"none",cursor:"pointer",position:"relative",transition:"background 0.2s"}}>
              <div style={{position:"absolute",top:3,left:usePlantMod?22:3,width:18,height:18,borderRadius:9,background:"#fff",transition:"left 0.2s",boxShadow:"0 1px 3px rgba(0,0,0,0.2)"}}/>
            </button>
          </div>
        </div>

        {/* FloraPro */}
        <button onClick={()=>{setBrand("florapro");setSystem(null);setPlant(null);setStage(null);setSupps(new Set());setStep(2);}}
          style={{display:"flex",alignItems:"stretch",width:"100%",marginBottom:10,background:brand==="florapro"?`linear-gradient(135deg,#1B9E7815,#1B9E7805)`:GH.card,border:`1px solid ${brand==="florapro"?"#1B9E78":GH.border}`,cursor:"pointer",textAlign:"left",padding:0,transition:"all 0.15s"}}>
          <div style={{width:72,background:"#1B9E7822",borderRight:"1px solid #1B9E7844",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",flexShrink:0,gap:3,padding:"20px 0"}}>
            <span style={{fontFamily:"-apple-system,BlinkMacSystemFont,'SF Pro Display','Helvetica Neue',sans-serif",fontSize:11,fontWeight:900,color:"#1B9E78",letterSpacing:"0.12em"}}>FLORA</span>
            <span style={{fontFamily:"-apple-system,BlinkMacSystemFont,'SF Pro Display','Helvetica Neue',sans-serif",fontSize:11,fontWeight:900,color:"#1B9E78",letterSpacing:"0.12em"}}>PRO</span>
          </div>
          <div style={{flex:1,padding:"18px 20px"}}>
            <div style={{fontFamily:"-apple-system,BlinkMacSystemFont,'SF Pro Display','Helvetica Neue',sans-serif",fontSize:24,fontWeight:900,color:brand==="florapro"?"#1B9E78":GH.text,textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:4}}>FloraPro</div>
            <div style={{fontSize:12,color:GH.muted,fontFamily:"-apple-system,BlinkMacSystemFont,'SF Pro Text','Helvetica Neue',sans-serif",marginBottom:6}}>Standard · High EC</div>
            <div style={{fontSize:11,color:GH.dim,fontFamily:"-apple-system,BlinkMacSystemFont,'SF Pro Text','Helvetica Neue',sans-serif"}}>Powder concentrate system for commercial and high-performance grows.</div>
          </div>
          {brand==="florapro"&&<div style={{width:4,background:"#1B9E78",flexShrink:0}}/>}
        </button>

        {/* BioThrive */}
        <button onClick={()=>{setBrand("biothrive");setSystem(null);setPlant(null);setStage(null);setSupps(new Set());setStep(2);}}
          style={{display:"flex",alignItems:"stretch",width:"100%",marginBottom:10,background:brand==="biothrive"?`linear-gradient(135deg,#E8910A15,#E8910A05)`:GH.card,border:`1px solid ${brand==="biothrive"?"#E8910A":GH.border}`,cursor:"pointer",textAlign:"left",padding:0,transition:"all 0.15s"}}>
          <div style={{width:72,background:"#E8910A22",borderRight:"1px solid #E8910A44",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",flexShrink:0,gap:3,padding:"20px 0"}}>
            <span style={{fontFamily:"-apple-system,BlinkMacSystemFont,'SF Pro Display','Helvetica Neue',sans-serif",fontSize:11,fontWeight:900,color:"#E8910A",letterSpacing:"0.08em"}}>BIO</span>
            <span style={{fontFamily:"-apple-system,BlinkMacSystemFont,'SF Pro Display','Helvetica Neue',sans-serif",fontSize:11,fontWeight:900,color:"#E8910A",letterSpacing:"0.08em"}}>THRIVE</span>
          </div>
          <div style={{flex:1,padding:"18px 20px"}}>
            <div style={{fontFamily:"-apple-system,BlinkMacSystemFont,'SF Pro Display','Helvetica Neue',sans-serif",fontSize:24,fontWeight:900,color:brand==="biothrive"?"#E8910A":GH.text,textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:4}}>BioThrive</div>
            <div style={{fontSize:12,color:GH.muted,fontFamily:"-apple-system,BlinkMacSystemFont,'SF Pro Text','Helvetica Neue',sans-serif",marginBottom:6}}>Basic 2-Part · Custom 7-Part</div>
            <div style={{fontSize:11,color:GH.dim,fontFamily:"-apple-system,BlinkMacSystemFont,'SF Pro Text','Helvetica Neue',sans-serif"}}>Organic-based professional system with targeted supplements for veg and bloom.</div>
          </div>
          {brand==="biothrive"&&<div style={{width:4,background:"#E8910A",flexShrink:0}}/>}
        </button>

        {/* MaxiSeries */}
        <button onClick={()=>{setBrand("maxi");setSystem(null);setPlant(null);setStage(null);setSupps(new Set());setStep(2);}}
          style={{display:"flex",alignItems:"stretch",width:"100%",marginBottom:10,background:brand==="maxi"?`linear-gradient(135deg,#1565C015,#1565C005)`:GH.card,border:`1px solid ${brand==="maxi"?"#1565C0":GH.border}`,cursor:"pointer",textAlign:"left",padding:0,transition:"all 0.15s"}}>
          <div style={{width:72,background:"#1565C022",borderRight:"1px solid #1565C044",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",flexShrink:0,gap:3,padding:"20px 0"}}>
            <span style={{fontFamily:"-apple-system,BlinkMacSystemFont,'SF Pro Display','Helvetica Neue',sans-serif",fontSize:11,fontWeight:900,color:"#1565C0",letterSpacing:"0.1em"}}>MAXI</span>
            <span style={{fontFamily:"-apple-system,BlinkMacSystemFont,'SF Pro Display','Helvetica Neue',sans-serif",fontSize:11,fontWeight:900,color:"#1565C0",letterSpacing:"0.08em"}}>SERIES</span>
          </div>
          <div style={{flex:1,padding:"18px 20px"}}>
            <div style={{fontFamily:"-apple-system,BlinkMacSystemFont,'SF Pro Display','Helvetica Neue',sans-serif",fontSize:24,fontWeight:900,color:brand==="maxi"?"#1565C0":GH.text,textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:4}}>MaxiSeries</div>
            <div style={{fontSize:12,color:GH.muted,fontFamily:"-apple-system,BlinkMacSystemFont,'SF Pro Text','Helvetica Neue',sans-serif",marginBottom:6}}>Indoor 2-Part · Outdoor 1-Part</div>
            <div style={{fontSize:11,color:GH.dim,fontFamily:"-apple-system,BlinkMacSystemFont,'SF Pro Text','Helvetica Neue',sans-serif"}}>Professional dry concentrate system — simple 1 or 2 product mixing for any environment.</div>
          </div>
          {brand==="maxi"&&<div style={{width:4,background:"#1565C0",flexShrink:0}}/>}
        </button>

        {/* FloraNova */}
        <button onClick={()=>{setBrand("floranvoa");setSystem(null);setPlant(null);setStage(null);setSupps(new Set());setStep(2);}}
          style={{display:"flex",alignItems:"stretch",width:"100%",marginBottom:10,background:brand==="floranvoa"?`linear-gradient(135deg,#00838F15,#00838F05)`:GH.card,border:`1px solid ${brand==="floranvoa"?"#00838F":GH.border}`,cursor:"pointer",textAlign:"left",padding:0,transition:"all 0.15s"}}>
          <div style={{width:72,background:"#00838F22",borderRight:"1px solid #00838F44",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",flexShrink:0,gap:3,padding:"20px 0"}}>
            <span style={{fontFamily:"-apple-system,BlinkMacSystemFont,'SF Pro Display','Helvetica Neue',sans-serif",fontSize:11,fontWeight:900,color:"#00838F",letterSpacing:"0.06em"}}>FLORA</span>
            <span style={{fontFamily:"-apple-system,BlinkMacSystemFont,'SF Pro Display','Helvetica Neue',sans-serif",fontSize:11,fontWeight:900,color:"#00838F",letterSpacing:"0.06em"}}>NOVA</span>
          </div>
          <div style={{flex:1,padding:"18px 20px"}}>
            <div style={{fontFamily:"-apple-system,BlinkMacSystemFont,'SF Pro Display','Helvetica Neue',sans-serif",fontSize:24,fontWeight:900,color:brand==="floranvoa"?"#00838F":GH.text,textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:4}}>FloraNova</div>
            <div style={{fontSize:12,color:GH.muted,fontFamily:"-apple-system,BlinkMacSystemFont,'SF Pro Text','Helvetica Neue',sans-serif",marginBottom:6}}>1-Part · 4-Part · 8-Part</div>
            <div style={{fontSize:11,color:GH.dim,fontFamily:"-apple-system,BlinkMacSystemFont,'SF Pro Text','Helvetica Neue',sans-serif"}}>Liquid concentrate with dry-strength performance. One product per stage — simple and powerful.</div>
          </div>
          {brand==="floranvoa"&&<div style={{width:4,background:"#00838F",flexShrink:0}}/>}
        </button>
      </div>
    );

    // ── STEP 1: SYSTEM PICKER ───────────────────────────────────────────────
    if(step===2) {
      const brandSystems = brand==="classic"
        ? [SYSTEM_CONFIGS["3part"],SYSTEM_CONFIGS["6part"],SYSTEM_CONFIGS["10part"]]
        : brand==="florapro"
        ? [SYSTEM_CONFIGS["florapro_std"],SYSTEM_CONFIGS["florapro_highec"]]
        : brand==="maxi"
        ? [SYSTEM_CONFIGS["maxi_indoor"],SYSTEM_CONFIGS["maxi_outdoor"]]
        : brand==="floranvoa"
        ? [SYSTEM_CONFIGS["floranvoa_1part"],SYSTEM_CONFIGS["floranvoa_4part"],SYSTEM_CONFIGS["floranvoa_8part"]]
        : [SYSTEM_CONFIGS["biothrive_basic"],SYSTEM_CONFIGS["biothrive_custom"]];
      const backLabel = brand==="classic"?"CLASSIC":brand==="florapro"?"FLORAPRO":brand==="maxi"?"MAXISERIES":brand==="floranvoa"?"FLORANOVA":"BIOTHRIVE";
      return (
        <div>
          <button onClick={()=>setStep(0)} style={{display:"flex",alignItems:"center",gap:6,background:"none",border:"none",color:GH.dim,cursor:"pointer",fontFamily:"-apple-system,BlinkMacSystemFont,'SF Pro Display','Helvetica Neue',sans-serif",fontSize:12,fontWeight:700,letterSpacing:"0.1em",paddingLeft:0,marginBottom:4,paddingTop:8}}>
            ← {backLabel}
          </button>
          <div style={sectionLabel()}>{brand==="classic"?"SELECT SYSTEM":"SELECT PROGRAM"}</div>
          {brandSystems.map(sys=>{
            const sel=system===sys.id;
            return (
              <button key={sys.id} onClick={()=>{setSystem(sys.id);setPlant(null);setStage(null);setSupps(new Set());setStep(3);}}
                style={{display:"flex",alignItems:"stretch",width:"100%",marginBottom:8,background:sel?`linear-gradient(135deg,${sys.color}15,${sys.color}05)`:GH.card,border:`1px solid ${sel?sys.color:GH.border}`,cursor:"pointer",textAlign:"left",padding:0,transition:"all 0.15s"}}>
                <div style={{width:72,background:`${sys.color}22`,borderRight:`1px solid ${sys.color}44`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",flexShrink:0,gap:2,padding:"20px 0"}}>
                  <span style={{fontFamily:"-apple-system,BlinkMacSystemFont,'SF Pro Display','Helvetica Neue',sans-serif",fontSize:sys.isPowder?13:28,fontWeight:900,color:sys.color,lineHeight:1}}>{sys.parts}</span>
                  {sys.isPowder&&<span style={{fontFamily:"-apple-system,BlinkMacSystemFont,'SF Pro Display','Helvetica Neue',sans-serif",fontSize:8,fontWeight:700,color:sys.color,letterSpacing:"0.1em"}}>POWDER</span>}
                </div>
                <div style={{flex:1,padding:"16px 18px"}}>
                  <div style={{fontFamily:"-apple-system,BlinkMacSystemFont,'SF Pro Display','Helvetica Neue',sans-serif",fontSize:20,fontWeight:800,color:sel?sys.color:GH.text,textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:3}}>{sys.name}</div>
                  <div style={{fontSize:11,color:sel?sys.color:GH.muted,marginBottom:4,fontFamily:"-apple-system,BlinkMacSystemFont,'SF Pro Text','Helvetica Neue',sans-serif"}}>{sys.tagline}</div>
                  <div style={{fontSize:11,color:GH.dim,fontFamily:"-apple-system,BlinkMacSystemFont,'SF Pro Text','Helvetica Neue',sans-serif"}}>{sys.desc}</div>
                </div>
                {sel&&<div style={{width:4,background:sys.color,flexShrink:0}}/>}
              </button>
            );
          })}
        </div>
      );
    }

    // ── STEP 2: PLANT ───────────────────────────────────────────────────────
    if(step===3) return (
      <div>
        <div style={sectionLabel()}>SELECT CROP</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
          {PLANTS.map(p=>{
            const sel=plant===p.id;
            const stgCount=p.maxStages.filter(s=>sysCfg?.stages.includes(s)).length;
            return (
              <button key={p.id} onClick={()=>{setPlant(p.id);setStage(null);setSupps(new Set());setStep(4);}}
                style={{display:"flex",flexDirection:"column",alignItems:"center",padding:"20px 12px",background:sel?`linear-gradient(135deg,${GH.green}20,${GH.green}08)`:GH.card,border:`1px solid ${sel?GH.green:GH.border}`,cursor:"pointer",textAlign:"center",position:"relative",transition:"all 0.15s"}}>
                {sel&&<div style={{position:"absolute",top:0,left:0,right:0,height:3,background:GH.green}}/>}
                <span style={{fontSize:36,marginBottom:8}}>{p.icon}</span>
                <div style={{fontFamily:"-apple-system,BlinkMacSystemFont,'SF Pro Display','Helvetica Neue',sans-serif",fontSize:15,fontWeight:700,color:sel?GH.green:GH.text,textTransform:"uppercase",letterSpacing:"0.04em"}}>{p.name}</div>
                <div style={{fontSize:10,color:GH.dim,marginTop:3,fontFamily:"-apple-system,BlinkMacSystemFont,'SF Pro Text','Helvetica Neue',sans-serif"}}>{stgCount} stage{stgCount!==1?"s":""}</div>
              </button>
            );
          })}
        </div>
      </div>
    );

    // ── STEP 4: STAGE ───────────────────────────────────────────────────────
    if(step===4) return (
      <div>
        <div style={sectionLabel()}>GROWTH STAGE</div>
        {avail.map(s=>{
          const sel=stage===s.id;

          return (
            <button key={s.id} onClick={()=>{setStage(s.id);setStep(5);}}
              style={{display:"flex",alignItems:"center",gap:14,width:"100%",marginBottom:8,padding:"16px 18px",background:sel?`${s.color}18`:GH.card,border:`1px solid ${sel?s.color:GH.border}`,cursor:"pointer",textAlign:"left",transition:"all 0.15s"}}>
              <div style={{width:14,height:14,borderRadius:"50%",background:s.color,flexShrink:0,boxShadow:sel?`0 0 12px ${s.color}88`:"none"}}/>
              <div style={{flex:1}}>
                <div style={{fontFamily:"-apple-system,BlinkMacSystemFont,'SF Pro Display','Helvetica Neue',sans-serif",fontSize:17,fontWeight:700,color:sel?s.color:GH.text,textTransform:"uppercase",letterSpacing:"0.04em"}}>{s.label}</div>
                <div style={{fontSize:11,color:GH.dim,marginTop:2,fontFamily:"-apple-system,BlinkMacSystemFont,'SF Pro Text','Helvetica Neue',sans-serif"}}>{s.desc}</div>
              </div>
              {sel&&<span style={{color:s.color,fontSize:20,fontWeight:700}}>→</span>}
            </button>
          );
        })}
      </div>
    );

    // ── STEP 5: SETTINGS ────────────────────────────────────────────────────
    if(step===5) return (
      <div>
        <div style={sectionLabel()}>RESERVOIR VOLUME</div>
        <div style={{display:"flex",alignItems:"stretch",background:GH.card,borderRadius:14,border:`1px solid ${GH.border}`,overflow:"hidden",marginBottom:8}}>
          <button onClick={()=>setVolume(v=>Math.max(0.5,+(v-(unit==="gallons"?0.5:1)).toFixed(1)))} style={{flexShrink:0,width:64,background:"none",border:"none",borderRight:`1px solid ${GH.border}`,color:GH.green,fontSize:26,cursor:"pointer",fontFamily:"-apple-system,BlinkMacSystemFont,'SF Pro Display','Helvetica Neue',sans-serif",fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center"}}>−</button>
          <input type="number" inputMode="decimal" min="0.1" step={unit==="gallons"?"0.5":"1"} value={volume} onChange={e=>setVolume(Math.max(0.1,+e.target.value))}
            style={{flex:1,minWidth:0,width:"100%",textAlign:"center",fontSize:28,color:GH.text,background:"none",border:"none",outline:"none",fontFamily:"-apple-system,BlinkMacSystemFont,'SF Pro Display','Helvetica Neue',sans-serif",fontWeight:700,padding:"16px 0"}}/>
          <button onClick={()=>setVolume(v=>+(v+(unit==="gallons"?0.5:1)).toFixed(1))} style={{flexShrink:0,width:64,background:"none",border:"none",borderLeft:`1px solid ${GH.border}`,color:GH.green,fontSize:26,cursor:"pointer",fontFamily:"-apple-system,BlinkMacSystemFont,'SF Pro Display','Helvetica Neue',sans-serif",fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center"}}>+</button>
        </div>
        <div style={{display:"flex",gap:0,marginBottom:24}}>
          {[["gallons","GALLONS"],["liters","LITERS"]].map(([v,l],i)=>(
            <button key={v} onClick={()=>setUnit(v)} style={{flex:1,padding:"12px",background:unit===v?GH.green:"none",border:`1px solid ${unit===v?GH.green:GH.border}`,borderLeft:i>0?"none":undefined,color:unit===v?"#000":GH.muted,fontFamily:"-apple-system,BlinkMacSystemFont,'SF Pro Display','Helvetica Neue',sans-serif",fontSize:14,fontWeight:700,letterSpacing:"0.1em",cursor:"pointer",transition:"all 0.15s"}}>{l}</button>
          ))}
        </div>

        <div style={sectionLabel()}>WATER SOURCE</div>
        <div style={{display:"flex",marginBottom:8}}>
          {[["tap","🚰","TAP"],["soft","💧","SOFT"],["ro","🔬","RO/DI"]].map(([v,icon,l],i)=>(
            <button key={v} onClick={()=>setWater(v)} style={{flex:1,padding:"14px 8px",background:water===v?`${GH.blue}22`:"none",border:`1px solid ${water===v?GH.blue:GH.border}`,borderLeft:i>0?"none":undefined,color:water===v?GH.blue:GH.muted,fontFamily:"-apple-system,BlinkMacSystemFont,'SF Pro Display','Helvetica Neue',sans-serif",fontSize:13,fontWeight:700,letterSpacing:"0.06em",cursor:"pointer",transition:"all 0.15s"}}>
              <div style={{fontSize:18,marginBottom:4}}>{icon}</div>{l}
            </button>
          ))}
        </div>
        {water==="tap"  &&<div style={ghAlert(GH.orange)}>Tap baseline +0.4 mS/cm. CALiMAGiC auto-reduced 50%. Minimum maintained to prevent Blossom End Rot.</div>}
        {water==="soft" &&<div style={ghAlert(GH.blue)}>Soft water +0.2 mS/cm baseline. CALiMAGiC at full chart dose.</div>}
        {water==="ro"   &&<div style={ghAlert(GH.green)}>RO/DI: 0.0 EC baseline. CALiMAGiC boosted 1.25× — pure water has no buffering capacity.</div>}

        <div style={{...sectionLabel(),marginTop:24}}>FEED STRENGTH</div>
        {sysCfg?.isPowder?(
          <div style={ghAlert(sysCfg.color)}>
            <strong style={{fontFamily:"-apple-system,BlinkMacSystemFont,'SF Pro Display','Helvetica Neue',sans-serif",letterSpacing:"0.06em"}}>{sysCfg.name}</strong> uses fixed doses from the official GH Powder Feed Program chart — no strength tiers. Doses shown are ml/gal of <strong>1 lb/gal concentrated stock solution</strong>, not direct additions. Standard and High EC are separate programs.
          </div>
        ):Object.entries(STRENGTH_META).map(([key,meta])=>{
          const sel=strength===key;
          return (
            <button key={key} onClick={()=>setStrength(key)}
              style={{display:"flex",alignItems:"center",gap:14,width:"100%",marginBottom:8,padding:"16px 18px",background:sel?`${meta.color}18`:GH.card,border:`1px solid ${sel?meta.color:GH.border}`,cursor:"pointer",textAlign:"left",transition:"all 0.15s"}}>
              <div style={{width:14,height:14,borderRadius:"50%",background:meta.color,flexShrink:0}}/>
              <div style={{flex:1}}>
                <div style={{fontFamily:"-apple-system,BlinkMacSystemFont,'SF Pro Display','Helvetica Neue',sans-serif",fontSize:17,fontWeight:700,color:sel?meta.color:GH.text,textTransform:"uppercase",letterSpacing:"0.04em"}}>{meta.label}</div>
                <div style={{fontSize:11,color:GH.dim,fontFamily:"-apple-system,BlinkMacSystemFont,'SF Pro Text','Helvetica Neue',sans-serif",marginTop:2}}>{meta.desc}</div>
              </div>
              {sel&&<div style={{width:3,height:36,background:meta.color,borderRadius:2}}/>}
            </button>
          );
        })}
        <button onClick={()=>setStep(6)} style={ghPrimaryBtn()}>NEXT: SUPPLEMENTS →</button>
      </div>
    );

    // ── STEP 6: SUPPLEMENTS ─────────────────────────────────────────────────
    if(step===6) {
      // Group suppData by category, sorted by CAT_META order
      const catOrder = Object.entries(CAT_META).sort((a,b)=>a[1].order-b[1].order).map(([k])=>k);
      const grouped = catOrder.map(catId => {
        const items = suppData.filter(s=>s.category===catId);
        if(!items.length) return null;
        const meta = CAT_META[catId];
        const recCount = items.filter(s=>getSuppRec(s,plant,stage)?.level==="recommended").length;
        const selCount = items.filter(s=>supps.has(s.id)).length;
        const isOpen = openCats.has(catId);
        return { catId, meta, items, recCount, selCount, isOpen };
      }).filter(Boolean);

      // Auto-open cats with recommended items on first render
      const toggleCat = (catId) => setOpenCats(prev => {
        const n = new Set(prev);
        n.has(catId) ? n.delete(catId) : n.add(catId);
        return n;
      });

      return (
        <div>
          {conflicts.length>0&&conflicts.map(c=>(
            <div key={c.a+c.b} style={ghAlert("#e05050")}>⚠ {c.aName} + {c.bName} conflict — do not use together.</div>
          ))}
          {sysCfg?.includedKeys.length>0&&(
            <div style={ghAlert(GH.blue)}>
              <strong style={{fontFamily:"-apple-system,BlinkMacSystemFont,'SF Pro Display','Helvetica Neue',sans-serif",letterSpacing:"0.06em"}}>{sysCfg.name}</strong> already includes:{" "}
              {sysCfg.includedKeys.map(k=>INCL_META[k]?.name).filter(Boolean).join(", ")}. Pre-calculated from chart — shown on Results page.
            </div>
          )}
          <div style={sectionLabel()}>OPTIONAL SUPPLEMENTS</div>
          {grouped.map(({ catId, meta, items, recCount, selCount, isOpen })=>(
            <div key={catId} style={{marginBottom:8}}>
              {/* Category header — always visible */}
              <button onClick={()=>toggleCat(catId)}
                style={{display:"flex",alignItems:"center",gap:12,width:"100%",padding:"14px 16px",background:selCount>0?`${meta.color}10`:GH.card,border:`1px solid ${selCount>0?meta.color:GH.border}`,borderBottom:isOpen?`1px solid ${GH.border}`:"none",cursor:"pointer",textAlign:"left",transition:"all 0.15s"}}>
                <span style={{fontSize:22,flexShrink:0}}>{meta.icon}</span>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
                    <span style={{fontFamily:"-apple-system,BlinkMacSystemFont,'SF Pro Display','Helvetica Neue',sans-serif",fontSize:16,fontWeight:700,color:selCount>0?meta.color:GH.text,textTransform:"uppercase",letterSpacing:"0.05em"}}>{meta.label}</span>
                    {recCount>0&&<span style={{fontSize:9,fontFamily:"-apple-system,BlinkMacSystemFont,'SF Pro Display','Helvetica Neue',sans-serif",fontWeight:700,letterSpacing:"0.1em",color:GH.green,background:"rgba(120,190,32,0.1)",border:"1px solid rgba(120,190,32,0.35)",padding:"1px 7px"}}>{recCount} RECOMMENDED</span>}
                    {selCount>0&&<span style={{fontSize:9,fontFamily:"-apple-system,BlinkMacSystemFont,'SF Pro Display','Helvetica Neue',sans-serif",fontWeight:700,letterSpacing:"0.1em",color:meta.color,background:`${meta.color}18`,border:`1px solid ${meta.color}55`,borderRadius:7,padding:"1px 7px"}}>{selCount} SELECTED</span>}
                  </div>
                  {!isOpen&&<div style={{fontSize:11,color:GH.dim,fontFamily:"-apple-system,BlinkMacSystemFont,'SF Pro Text','Helvetica Neue',sans-serif",marginTop:2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{meta.desc.split(".")[0]}.</div>}
                </div>
                <span style={{color:GH.dim,fontSize:16,flexShrink:0,marginLeft:4}}>{isOpen?"▲":"▼"}</span>
              </button>

              {/* Expanded body */}
              {isOpen&&(
                <div style={{border:`1px solid ${GH.border}`,borderTop:"none",background:"#fdfdfd"}}>
                  {/* Category description */}
                  <div style={{padding:"12px 16px",borderBottom:`1px solid ${GH.border}`,fontSize:12,color:GH.muted,fontFamily:"-apple-system,BlinkMacSystemFont,'SF Pro Text','Helvetica Neue',sans-serif",lineHeight:1.6,background:GH.card}}>
                    {meta.desc}
                  </div>
                  {/* Supplement rows sorted recommended first */}
                  {[...items].sort((a,b)=>{
                    const order={recommended:0,optional:1,skip:2};
                    const ra=getSuppRec(a,plant,stage)?.level||"optional";
                    const rb=getSuppRec(b,plant,stage)?.level||"optional";
                    return (order[ra]??1)-(order[rb]??1);
                  }).map(s=>{
                    const on=supps.has(s.id), applicable=!!s.dose, tapR=on&&water==="tap"&&s.tapWaterWarning;
                    const conflict=conflictIds.has(s.id)&&on;
                    const rowColor=conflict?"#e05050":meta.color;
                    const rec=getSuppRec(s,plant,stage);
                    const recBadge = rec?.level==="recommended"
                      ? {label:"RECOMMENDED", color:GH.green, bg:"rgba(120,190,32,0.1)", border:"rgba(120,190,32,0.35)"}
                      : rec?.level==="skip"
                      ? {label:"NOT TYPICAL",  color:GH.dim,   bg:"rgba(0,0,0,0.04)",    border:"rgba(0,0,0,0.1)"}
                      : null;
                    return (
                      <div key={s.id} onClick={()=>applicable&&toggleSupp(s.id)}
                        style={{display:"flex",alignItems:"center",gap:12,padding:"13px 16px",background:on?`${rowColor}10`:"#fff",borderBottom:`1px solid ${GH.border}`,cursor:applicable?"pointer":"default",opacity:!applicable?0.35:1,transition:"all 0.15s",position:"relative"}}>
                        {on&&<div style={{position:"absolute",left:0,top:0,bottom:0,width:3,background:rowColor}}/>}
                        <div style={{flex:1,minWidth:0,paddingLeft:on?4:0}}>
                          <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
                            <span style={{fontFamily:"-apple-system,BlinkMacSystemFont,'SF Pro Display','Helvetica Neue',sans-serif",fontSize:15,fontWeight:700,color:on?rowColor:GH.text,textTransform:"uppercase",letterSpacing:"0.04em"}}>{s.name}</span>
                            <span style={{fontSize:10,color:GH.dim,fontFamily:"-apple-system,BlinkMacSystemFont,'SF Pro Text','Helvetica Neue',sans-serif"}}>{s.brand}</span>
                            {recBadge&&<span style={{fontSize:9,fontFamily:"-apple-system,BlinkMacSystemFont,'SF Pro Display','Helvetica Neue',sans-serif",fontWeight:700,letterSpacing:"0.1em",color:recBadge.color,background:recBadge.bg,border:`1px solid ${recBadge.border}`,padding:"1px 7px"}}>{recBadge.label}</span>}
                          </div>
                          {rec?.reason&&<div style={{fontSize:10,color:rec.level==="recommended"?GH.green:GH.dim,fontFamily:"-apple-system,BlinkMacSystemFont,'SF Pro Text','Helvetica Neue',sans-serif",marginTop:2,lineHeight:1.4,fontStyle:rec.level==="skip"?"italic":"normal"}}>{rec.reason}</div>}
                          {applicable&&s.dose?(
                            <div style={{display:"flex",gap:8,alignItems:"baseline",marginTop:4,flexWrap:"wrap"}}>
                              <span style={{fontFamily:"-apple-system,BlinkMacSystemFont,'SF Pro Display','Helvetica Neue',sans-serif",fontSize:22,fontWeight:700,color:on?rowColor:GH.dim,lineHeight:1}}>{s.dose.ml}</span>
                              <span style={{fontSize:11,color:GH.dim,fontFamily:"-apple-system,BlinkMacSystemFont,'SF Pro Text','Helvetica Neue',sans-serif"}}>{s.dose.unit}</span>
                              {s.dose.note&&<span style={{fontSize:10,color:GH.orange,background:"rgba(247,148,29,0.1)",border:"1px solid rgba(247,148,29,0.25)",padding:"1px 8px",fontFamily:"-apple-system,BlinkMacSystemFont,'SF Pro Text','Helvetica Neue',sans-serif"}}>{s.dose.note}</span>}
                              {tapR&&<span style={{fontSize:10,color:GH.orange,fontFamily:"-apple-system,BlinkMacSystemFont,'SF Pro Text','Helvetica Neue',sans-serif"}}>−50% tap</span>}
                            </div>
                          ):(
                            <div style={{fontSize:11,color:GH.dim,fontStyle:"italic",marginTop:2,fontFamily:"-apple-system,BlinkMacSystemFont,'SF Pro Text','Helvetica Neue',sans-serif"}}>Not used — {stageObj?.label}</div>
                          )}
                        </div>
                        <div style={{width:20,height:20,border:`2px solid ${on?rowColor:GH.border}`,background:on?rowColor:"none",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.15s"}}>
                          {on&&<span style={{color:"#000",fontSize:12,fontWeight:900,lineHeight:1}}>✓</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
          <button onClick={()=>setStep(7)} style={ghPrimaryBtn()}>VIEW FEEDING SCHEDULE →</button>
        </div>
      );
    }

    // ── STEP 7: RESULTS ─────────────────────────────────────────────────────
    if(step===7) return (
      <div>
        {/* Context bar */}
        <div style={{background:GH.card,borderRadius:14,border:`1px solid ${GH.border}`,borderLeft:`4px solid ${sysCfg?.color||GH.green}`,padding:"12px 16px",marginBottom:12}}>
          <div style={{display:"flex",flexWrap:"wrap",gap:"6px 14px",alignItems:"center"}}>
            {sysCfg&&<span style={{fontFamily:"-apple-system,BlinkMacSystemFont,'SF Pro Display','Helvetica Neue',sans-serif",fontSize:14,fontWeight:800,color:sysCfg.color,textTransform:"uppercase",letterSpacing:"0.08em"}}>{sysCfg.name}</span>}
            <span style={{color:GH.dim}}>·</span>
            <span style={{fontSize:14,color:GH.text}}>{plantObj.icon} {plantObj.name}</span>
            <span style={{color:GH.dim}}>·</span>
            <span style={{fontSize:14,color:stageObj.color,fontFamily:"-apple-system,BlinkMacSystemFont,'SF Pro Display','Helvetica Neue',sans-serif",fontWeight:700}}>{stageObj.label}</span>
            <span style={{color:GH.dim}}>·</span>
            <span style={{fontSize:14,color:GH.text}}>{volume} {unit}</span>
            <span style={{color:GH.dim}}>·</span>
            <span style={{fontSize:14,color:STRENGTH_META[strength].color,fontFamily:"-apple-system,BlinkMacSystemFont,'SF Pro Display','Helvetica Neue',sans-serif",fontWeight:700}}>{STRENGTH_META[strength].label}</span>
            <span style={{color:GH.dim}}>·</span>
            <span style={{fontSize:14,color:GH.blue}}>{water==="ro"?"RO/DI":water==="soft"?"Soft":"Tap"}</span>
            <span style={{color:GH.dim}}>·</span>
            <span style={{fontSize:14,color:GH.muted,fontFamily:"-apple-system,BlinkMacSystemFont,'SF Pro Display','Helvetica Neue',sans-serif",fontWeight:700}}>{substrate==="hydro"?"Hydroponics":substrate==="inert"?"Inert Medium":substrate==="potting"?"Potting Soil":"Ground Soil"}</span>
            {supps.size>0&&<><span style={{color:GH.dim}}>·</span><span style={{fontSize:14,color:GH.orange}}>{supps.size} supp{supps.size>1?"s":""}</span></>}
          </div>
        </div>

        {/* Substrate reduction banner */}
        {substrate&&substrate!=="hydro"&&(
          <div style={{background:GH.card,borderRadius:14,border:`1px solid ${GH.orange}55`,borderLeft:`4px solid ${GH.orange}`,padding:"10px 16px",marginBottom:12}}>
            <div style={{fontFamily:"-apple-system,BlinkMacSystemFont,'SF Pro Display','Helvetica Neue',sans-serif",fontSize:11,fontWeight:700,color:GH.orange,letterSpacing:"0.08em",marginBottom:2}}>
              {substrate==="inert"?"INERT MEDIUM — 90% DOSE":substrate==="potting"?"POTTING SOIL — 60% DOSE":"GROUND SOIL — 40% DOSE"}
            </div>
            <div style={{fontSize:12,color:GH.muted,fontFamily:"-apple-system,BlinkMacSystemFont,'SF Pro Text','Helvetica Neue',sans-serif",lineHeight:1.5}}>
              {substrate==="inert"?"Doses reduced 10% for inert media. Coco and rockwool have minimal buffering — monitor EC and pH closely.":substrate==="potting"?"Doses reduced 40% for potting mix. Pre-amended soils hold residual nutrition. Start light and increase if deficiencies appear.":"Doses reduced 60% for ground soil. Native soil chemistry and organic matter buffer nutrient uptake significantly."}
            </div>
          </div>
        )}

        {/* Plant modifier info box — Classic liquid systems only */}
        {!sysCfg?.isPowder&&plantModMeta&&(
          <div style={{background:GH.card,borderRadius:14,border:`1px solid ${usePlantMod?GH.green+"55":"#ccc"}`,borderLeft:`4px solid ${usePlantMod?GH.green:"#ccc"}`,marginBottom:12,overflow:"hidden"}}>
            {/* Header */}
            <div style={{padding:"12px 16px",borderBottom:`1px solid ${usePlantMod?GH.green+"22":GH.border}`}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:8}}>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <span style={{fontSize:18}}>{plantObj.icon}</span>
                  <div>
                    <div style={{fontFamily:"-apple-system,BlinkMacSystemFont,'SF Pro Display','Helvetica Neue',sans-serif",fontSize:13,fontWeight:800,color:usePlantMod?GH.green:GH.dim,letterSpacing:"0.12em",textTransform:"uppercase"}}>
                      {plantObj.name} — Plant Modifiers
                    </div>
                    <div style={{fontSize:10,color:GH.dim,fontFamily:"-apple-system,BlinkMacSystemFont,'SF Pro Text','Helvetica Neue',sans-serif",marginTop:1}}>
                      EC ceiling: <span style={{color:usePlantMod?GH.orange:GH.dim,fontWeight:600}}>{plantModMeta.ecCeiling} mS/cm</span>
                    </div>
                  </div>
                </div>
                <span style={{fontSize:11,fontFamily:"-apple-system,BlinkMacSystemFont,'SF Pro Display','Helvetica Neue',sans-serif",fontWeight:700,letterSpacing:"0.1em",color:usePlantMod?GH.green:"#aaa",background:usePlantMod?`${GH.green}18`:"#f0f0f0",border:`1px solid ${usePlantMod?GH.green+"44":"#ddd"}`,borderRadius:8,padding:"3px 10px"}}>
                  {usePlantMod?"ACTIVE":"OFF"}
                </span>
              </div>
              {plantModMeta.ecNote&&<div style={{fontSize:11,color:GH.dim,fontFamily:"-apple-system,BlinkMacSystemFont,'SF Pro Text','Helvetica Neue',sans-serif",marginTop:8,lineHeight:1.5,fontStyle:"italic"}}>{plantModMeta.ecNote}</div>}
            </div>

            {/* Modifier rows */}
            {usePlantMod?(
              <div style={{padding:"10px 16px"}}>
                {plantModMeta.mods.map((m,i)=>(
                  <div key={i} style={{display:"flex",alignItems:"flex-start",gap:10,marginBottom:i<plantModMeta.mods.length-1?8:0}}>
                    <div style={{flexShrink:0,display:"flex",alignItems:"center",gap:6}}>
                      <div style={{width:8,height:8,borderRadius:"50%",background:m.dir==="↑"?GH.green:GH.orange,marginTop:3}}/>
                      <span style={{fontFamily:"-apple-system,BlinkMacSystemFont,'SF Pro Display','Helvetica Neue',sans-serif",fontSize:13,fontWeight:800,color:m.dir==="↑"?GH.green:GH.orange,whiteSpace:"nowrap"}}>
                        {m.bottle} {m.dir}
                      </span>
                    </div>
                    <span style={{fontSize:11,color:GH.muted,fontFamily:"-apple-system,BlinkMacSystemFont,'SF Pro Text','Helvetica Neue',sans-serif",lineHeight:1.5}}>{m.why}</span>
                  </div>
                ))}
              </div>
            ):(
              <div style={{padding:"10px 16px"}}>
                <div style={{fontSize:11,color:GH.dim,fontFamily:"-apple-system,BlinkMacSystemFont,'SF Pro Text','Helvetica Neue',sans-serif",fontStyle:"italic"}}>Plant modifiers are off — using standard chart doses. Turn on from the Brand page to apply crop-specific adjustments.</div>
              </div>
            )}
          </div>
        )}

        {/* EC Budget */}
        {ecData&&(
          <div style={{background:GH.card,borderRadius:14,border:`1px solid ${EC_COLOR[ecData.status]}55`,marginBottom:12,overflow:"hidden"}}>
            <button onClick={()=>setShowEC(v=>!v)} style={{width:"100%",display:"flex",alignItems:"center",gap:10,padding:"14px 16px",background:"none",border:"none",cursor:"pointer",textAlign:"left"}}>
              <span style={{fontFamily:"-apple-system,BlinkMacSystemFont,'SF Pro Display','Helvetica Neue',sans-serif",fontSize:11,fontWeight:700,letterSpacing:"0.08em",color:GH.muted,textTransform:"uppercase",flex:1}}>EC BUDGET</span>
              <span style={{fontFamily:"-apple-system,BlinkMacSystemFont,'SF Pro Text','Helvetica Neue',sans-serif",fontSize:11,color:EC_COLOR[ecData.status],background:`${EC_COLOR[ecData.status]}18`,border:`1px solid ${EC_COLOR[ecData.status]}44`,borderRadius:9,padding:"3px 12px",fontWeight:600}}>
                {ecData.status==="safe"?"✓ SAFE":ecData.status==="caution"?"⚠ CAUTION":"⚠ EXCEEDS CEILING"}
              </span>
              <span style={{fontFamily:"-apple-system,BlinkMacSystemFont,'SF Pro Display','Helvetica Neue',sans-serif",fontSize:28,fontWeight:900,color:EC_COLOR[ecData.status],marginLeft:8}}>{ecData.estimated}</span>
              <span style={{fontSize:10,color:GH.dim,marginLeft:2}}>mS/cm</span>
              <span style={{color:GH.dim,fontSize:12,marginLeft:4}}>{showEC?"▲":"▼"}</span>
            </button>
            {showEC&&(
              <div style={{padding:"0 16px 16px",borderTop:`1px solid ${GH.border}`}}>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginTop:14}}>
                  {[["CHART TARGET",`${ecData.chartMin}–${ecData.chartMax}`,GH.green],["WATER BASE",`+${ecData.waterBase}`,GH.orange],ecData.suppEC>0?["SUPPLEMENTS",`+${ecData.suppEC}`,"#c8a050"]:null,["PLANT CEILING",`${ecData.ceiling}`,EC_COLOR[ecData.status]]].filter(Boolean).map(([l,v,c])=>(
                    <div key={l} style={{background:"#FFFFFF",border:`1px solid ${GH.border}`,padding:"12px 14px"}}>
                      <div style={{fontFamily:"-apple-system,BlinkMacSystemFont,'SF Pro Display','Helvetica Neue',sans-serif",fontSize:9,color:GH.dim,letterSpacing:"0.08em",marginBottom:4}}>{l}</div>
                      <div style={{fontFamily:"-apple-system,BlinkMacSystemFont,'SF Pro Display','Helvetica Neue',sans-serif",fontSize:22,color:c,fontWeight:800}}>{v} <span style={{fontSize:11,color:GH.dim,fontWeight:400}}>mS/cm</span></div>
                    </div>
                  ))}
                </div>
                {plantModMeta?.ecNote&&<div style={{marginTop:10,fontSize:11,color:GH.muted,fontFamily:"-apple-system,BlinkMacSystemFont,'SF Pro Text','Helvetica Neue',sans-serif",lineHeight:1.6}}>{plantModMeta.ecNote}</div>}
                {ecData.status==="danger"&&<div style={{marginTop:10,fontSize:12,color:"#ff8a8a",fontFamily:"-apple-system,BlinkMacSystemFont,'SF Pro Text','Helvetica Neue',sans-serif",lineHeight:1.6}}>{ecDangerText(strength)}</div>}
                {ecData.status==="caution"&&<div style={{marginTop:10,fontSize:12,color:GH.orange,fontFamily:"-apple-system,BlinkMacSystemFont,'SF Pro Text','Helvetica Neue',sans-serif",lineHeight:1.6}}>Approaching the upper limit. Top off with plain water every 24–48 hrs to prevent salt concentration from evaporation.</div>}
              </div>
            )}
          </div>
        )}

        {/* Mixing Order — always visible, styled like supplement rows */}
        <div style={{marginBottom:12}}>
          <div style={sectionLabel()}>MIXING ORDER</div>
          <div style={{fontSize:11,color:GH.dim,marginBottom:12,fontFamily:"-apple-system,BlinkMacSystemFont,'SF Pro Text','Helvetica Neue',sans-serif",fontStyle:"italic"}}>Add to reservoir in this exact order. Never combine concentrates directly.</div>
          {mixSteps.map((s,i)=>(
            <div key={i} style={{display:"flex",alignItems:"center",gap:12,marginBottom:6,padding:"14px 16px",borderRadius:12,background:`${s.color}10`,border:`1px solid ${s.color}44`,position:"relative"}}>
              <div style={{position:"absolute",left:0,top:0,bottom:0,width:4,background:s.color}}/>
              <div style={{width:24,height:24,borderRadius:7,background:s.color,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginLeft:4}}>
                <span style={{fontFamily:"-apple-system,BlinkMacSystemFont,'SF Pro Display','Helvetica Neue',sans-serif",fontSize:12,fontWeight:900,color:"#fff"}}>{i+1}</span>
              </div>
              <div style={{flex:1}}>
                <div style={{fontFamily:"-apple-system,BlinkMacSystemFont,'SF Pro Display','Helvetica Neue',sans-serif",fontSize:15,fontWeight:700,color:s.color,textTransform:"uppercase",letterSpacing:"0.04em"}}>{s.label}</div>
                {s.note&&<div style={{fontSize:10,color:GH.dim,fontStyle:"italic",marginTop:2,fontFamily:"-apple-system,BlinkMacSystemFont,'SF Pro Text','Helvetica Neue',sans-serif"}}>{s.note}</div>}
                {s.warn&&<div style={{marginTop:4,fontSize:11,color:GH.orange,fontFamily:"-apple-system,BlinkMacSystemFont,'SF Pro Text','Helvetica Neue',sans-serif"}}>⚠ {s.warn}</div>}
              </div>
              <div style={{textAlign:"right",flexShrink:0}}>
                <span style={{fontFamily:"-apple-system,BlinkMacSystemFont,'SF Pro Display','Helvetica Neue',sans-serif",fontSize:28,fontWeight:900,color:s.color}}>{s.dose.ml}</span>
                <span style={{fontSize:11,color:GH.dim,fontFamily:"-apple-system,BlinkMacSystemFont,'SF Pro Text','Helvetica Neue',sans-serif"}}> {s.dose.unit||"ml"}</span>
                {s.dose.unit==="g"&&<div style={{fontSize:9,color:GH.dim,fontFamily:"-apple-system,BlinkMacSystemFont,'SF Pro Text','Helvetica Neue',sans-serif"}}>weigh out</div>}
              </div>
            </div>
          ))}
          <div style={{marginTop:10,padding:"12px 16px",background:GH.card,borderRadius:14,border:`1px solid ${GH.border}`,fontSize:11,color:GH.dim,fontFamily:"-apple-system,BlinkMacSystemFont,'SF Pro Text','Helvetica Neue',sans-serif",lineHeight:1.8}}>
            CHECK pH AFTER MIXING: &nbsp;
            {substrate==="hydro"&&<><span style={{color:GH.green,fontFamily:"-apple-system,BlinkMacSystemFont,'SF Pro Display','Helvetica Neue',sans-serif",fontWeight:700,fontSize:13}}>5.5–6.5</span> <span style={{color:GH.dim}}>— Hydroponics</span></>}
            {substrate==="inert"&&<><span style={{color:GH.green,fontFamily:"-apple-system,BlinkMacSystemFont,'SF Pro Display','Helvetica Neue',sans-serif",fontWeight:700,fontSize:13}}>5.8–6.2</span> <span style={{color:GH.dim}}>— Coco / Inert medium</span></>}
            {substrate==="potting"&&<><span style={{color:GH.green,fontFamily:"-apple-system,BlinkMacSystemFont,'SF Pro Display','Helvetica Neue',sans-serif",fontWeight:700,fontSize:13}}>6.0–6.8</span> <span style={{color:GH.dim}}>— Potting soil</span></>}
            {substrate==="soil"&&<><span style={{color:GH.green,fontFamily:"-apple-system,BlinkMacSystemFont,'SF Pro Display','Helvetica Neue',sans-serif",fontWeight:700,fontSize:13}}>6.0–7.0</span> <span style={{color:GH.dim}}>— Ground soil</span></>}
            {!substrate&&<><span style={{color:GH.green,fontFamily:"-apple-system,BlinkMacSystemFont,'SF Pro Display','Helvetica Neue',sans-serif",fontWeight:700,fontSize:13}}>5.5–6.5</span> hydro &nbsp;·&nbsp; <span style={{color:GH.green,fontFamily:"-apple-system,BlinkMacSystemFont,'SF Pro Display','Helvetica Neue',sans-serif",fontWeight:700,fontSize:13}}>6.0–7.0</span> soil</>}
          </div>
        </div>

      </div>
    );
    return null;
  };

  // ── STYLE HELPERS ──────────────────────────────────────────────────────────
  function sectionLabel() {
    return {fontFamily:"-apple-system,BlinkMacSystemFont,'SF Pro Display','Helvetica Neue',sans-serif",fontSize:11,fontWeight:700,letterSpacing:"0.12em",color:"#555",textTransform:"uppercase",marginBottom:10,marginTop:0,paddingTop:24,display:"block"};
  }
  function runBtn(color) {
    return {flex:1,padding:"11px 0",background:"none",border:"none",color:color,cursor:"pointer",fontFamily:"-apple-system,BlinkMacSystemFont,'SF Pro Display','Helvetica Neue',sans-serif",fontSize:12,fontWeight:700,letterSpacing:"0.1em"};
  }
  function ghAlert(color) {
    return {background:`${color}0f`,border:`1px solid ${color}44`,borderLeft:`3px solid ${color}`,borderRadius:12,padding:"10px 14px",marginBottom:10,fontSize:12,color:GH.muted,fontFamily:"-apple-system,BlinkMacSystemFont,'SF Pro Text','Helvetica Neue',sans-serif",lineHeight:1.6};
  }
  function ghPrimaryBtn() {
    return {width:"100%",marginTop:24,padding:"16px",background:GH.green,border:"none",borderRadius:14,color:"#fff",fontFamily:"-apple-system,BlinkMacSystemFont,'SF Pro Display','Helvetica Neue',sans-serif",fontSize:17,fontWeight:600,letterSpacing:"-0.01em",cursor:"pointer",boxShadow:"0 1px 3px rgba(120,190,32,0.3)"};
  }

  const GH_green = "#78BE20";
  const stepColors = ["#78BE20","#78BE20","#78BE20","#78BE20","#78BE20","#78BE20"];

  return (
    <div style={{minHeight:"100vh",background:"#F2F2F7",color:"#111111",fontFamily:"-apple-system,BlinkMacSystemFont,'SF Pro Text','Helvetica Neue',sans-serif",overflowX:"hidden"}}>
      {/* Header */}
      <div style={{background:"#FFFFFF",borderBottom:"0.5px solid rgba(0,0,0,0.1)",padding:"0 20px"}}>
        <div style={{maxWidth:480,margin:"0 auto",display:"flex",alignItems:"center",justifyContent:"space-between",padding:"16px 0"}}>
          <div>
            <div style={{fontFamily:"-apple-system,BlinkMacSystemFont,'SF Pro Display','Helvetica Neue',sans-serif",fontSize:9,fontWeight:700,letterSpacing:"0.18em",color:"#888",textTransform:"uppercase",marginBottom:2}}>GENERAL HYDROPONICS</div>
            <div style={{fontFamily:"-apple-system,BlinkMacSystemFont,'SF Pro Display','Helvetica Neue',sans-serif",fontSize:26,fontWeight:900,color:"#111111",textTransform:"uppercase",letterSpacing:"0.04em",lineHeight:1}}>
              FLORA SERIES <span style={{color:"#78BE20"}}>™</span>
            </div>
          </div>
          {sysCfg&&(
            <div style={{textAlign:"right"}}>
              <div style={{fontFamily:"-apple-system,BlinkMacSystemFont,'SF Pro Display','Helvetica Neue',sans-serif",fontSize:11,fontWeight:700,color:sysCfg.color,letterSpacing:"0.1em",textTransform:"uppercase"}}>{sysCfg.isPowder?(sysCfg.id.startsWith("bt")?"BIO":sysCfg.parts+"-PT"):sysCfg.parts+"-PART"}</div>
              <div style={{fontFamily:"-apple-system,BlinkMacSystemFont,'SF Pro Display','Helvetica Neue',sans-serif",fontSize:13,fontWeight:700,color:"#777",letterSpacing:"0.06em",textTransform:"uppercase"}}>{sysCfg.name.replace(/\d+-Part |FloraPro |BioThrive /,"")}</div>
            </div>
          )}
        </div>
      </div>

      {/* Green accent bar */}
      <div style={{height:2,background:"#78BE20",opacity:0.9}}/>

      {/* Step nav */}
      <div style={{position:"sticky",top:0,zIndex:50,background:"rgba(249,249,249,0.94)",backdropFilter:"blur(20px) saturate(1.8)",WebkitBackdropFilter:"blur(20px) saturate(1.8)",borderBottom:"0.5px solid rgba(0,0,0,0.12)"}}>
        <div style={{maxWidth:480,margin:"0 auto",display:"flex",overflowX:"auto"}}>
          {steps.map((label,i)=>{
            const active=step===i,done=i<step;
            const color=active?"#0A84FF":done?"#C7C7CC":"#78BE20";
            const dotColor=active?"#0A84FF":done?"transparent":"#78BE20";
            return (
              <button key={i} onClick={()=>goTo(i)} style={{flex:"1 0 0",minWidth:0,padding:"15px 3px 13px",background:"none",border:"none",cursor:"pointer",position:"relative",display:"flex",flexDirection:"column",alignItems:"center",gap:6,transition:"all 0.2s"}}>
                <span style={{fontFamily:"-apple-system,BlinkMacSystemFont,'SF Pro Text','Helvetica Neue',sans-serif",fontSize:10,fontWeight:active?700:600,letterSpacing:"0.02em",color,whiteSpace:"nowrap",transition:"all 0.2s"}}>{label}</span>
                <span style={{width:active?16:5,height:5,borderRadius:3,background:dotColor,transition:"all 0.25s cubic-bezier(.4,0,.2,1)"}}/>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div style={{maxWidth:480,margin:"0 auto",padding:"20px 16px 80px"}}>
        {renderStep()}
      </div>

      {/* Disclaimer Modal — rendered at top level so it's not affected by step changes */}
      {showDisclaimer&&(
        <div style={{position:"fixed",top:0,left:0,right:0,bottom:0,background:"rgba(0,0,0,0.6)",zIndex:1000,display:"flex",alignItems:"flex-end",justifyContent:"center"}}
          onClick={()=>setShowDisclaimer(false)}>
          <div style={{background:"#fff",width:"100%",maxWidth:600,maxHeight:"85vh",overflowY:"auto",padding:"28px 24px 40px",borderRadius:"20px 20px 0 0"}}
            onClick={e=>e.stopPropagation()}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
              <div style={{fontFamily:"-apple-system,BlinkMacSystemFont,'SF Pro Display','Helvetica Neue',sans-serif",fontSize:20,fontWeight:900,color:"#111",letterSpacing:"0.05em",textTransform:"uppercase"}}>Legal Disclaimer</div>
              <button onClick={()=>setShowDisclaimer(false)} style={{background:"none",border:"none",fontSize:22,color:"#777",cursor:"pointer",lineHeight:1}}>✕</button>
            </div>
            {[
              { title:"No Liability", body:"This application provides nutrient dosing guidance based on General Hydroponics' publicly available feedcharts and general agronomic best practices. Crop results vary significantly based on environmental conditions, water chemistry, genetics, growing methods, and grower experience. The creators of this app accept no responsibility or liability for crop loss, damage, reduced yield, or any other adverse outcome resulting from the use of this application." },
              { title:'"As-Is" Software & No Warranty', body:'This application is provided on an "as-is" and "as-available" basis, without warranties of any kind, either express or implied. We are not liable for typographical errors, calculation bugs, system downtimes, or any damages arising from reliance on the software\'s outputs.' },
              { title:"User Responsibility", body:"You are solely responsible for monitoring your plants, measuring EC and pH before and after mixing, and adjusting doses to suit your specific conditions. This app is a starting point — not a substitute for your own observation and judgment. Always start with the Light feed strength if you are new to a system or a new batch of inputs, and increase gradually based on plant response." },
              { title:"Health & Consumption", body:"This application provides agricultural guidance only, not health, dietary, or medical advice. We make no guarantees regarding the safety, edibility, or quality of any harvested crops. Consuming the end product grown using guidance from this app is done entirely at your own risk." },
              { title:"Not Affiliated with General Hydroponics", body:"This application is an independent tool and is not affiliated with, endorsed by, sponsored by, or officially supported by General Hydroponics, Hawthorne Gardening Company, or any of their subsidiaries. All product names, trademarks, and brand references are the property of their respective owners and are used here solely for identification purposes." },
              { title:"Start Low, Go Slow", body:"Feeding recommendations are provided at three strength tiers: Light, Medium, and Aggressive. If you are new to a system, a new strain, or growing in a new environment, always begin at the Light tier. Overfeeding is one of the most common causes of crop stress and nutrient lockout. It is far easier to correct an underfed plant than to recover from nutrient burn or salt toxicity." },
              { title:"Legal Compliance & Age Restriction", body:"This app does not make any representations about the legality of the crops you are growing. It is your sole responsibility to ensure that your growing activities comply with all applicable local, state, federal, and international laws and regulations. You must be of legal age in your jurisdiction to use this application. The inclusion of any plant type in this application does not constitute endorsement or encouragement of any illegal activity." },
              { title:"Modifications to Terms", body:"We reserve the right to modify this disclaimer at any time without prior notice. Continued use of the application constitutes acceptance of any changes." },
            ].map(({title,body})=>(
              <div key={title} style={{marginBottom:20}}>
                <div style={{fontFamily:"-apple-system,BlinkMacSystemFont,'SF Pro Display','Helvetica Neue',sans-serif",fontSize:14,fontWeight:800,color:"#111",letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:6}}>{title}</div>
                <div style={{fontSize:13,color:"#555",fontFamily:"-apple-system,BlinkMacSystemFont,'SF Pro Text','Helvetica Neue',sans-serif",lineHeight:1.7}}>{body}</div>
              </div>
            ))}
            <div style={{marginTop:8,paddingTop:16,borderTop:"1px solid #e0e0e0",fontSize:11,color:"#777",fontFamily:"-apple-system,BlinkMacSystemFont,'SF Pro Text','Helvetica Neue',sans-serif",lineHeight:1.6,textAlign:"center"}}>
              By using this application you acknowledge that you have read and agree to this disclaimer.
            </div>
          </div>
        </div>
      )}

      <style>{`
        *{box-sizing:border-box;-webkit-tap-highlight-color:transparent;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;}
        body{font-family:-apple-system,BlinkMacSystemFont,'SF Pro Text','Helvetica Neue',sans-serif;background:#F2F2F7;}
        input[type=number]::-webkit-inner-spin-button,input[type=number]::-webkit-outer-spin-button{-webkit-appearance:none;appearance:none;margin:0}
        input[type=number]{-moz-appearance:textfield;border-radius:10px}
        input{border-radius:10px}
        ::-webkit-scrollbar{display:none}
        button{border-radius:14px;overflow:hidden;transition:transform .18s cubic-bezier(.4,0,.2,1),opacity .18s ease,background .18s ease;}
        button:active{transform:scale(.97);opacity:.85}
        ::selection{background:#78BE2044}
      `}</style>
    </div>
  );
}
