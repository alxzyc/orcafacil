"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.supabase = void 0;
// @ts-nocheck
var supabase_js_1 = require("@supabase/supabase-js");
var supabaseUrl = '';
var supabaseAnonKey = '';
exports.supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseAnonKey);
