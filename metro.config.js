// Configuração do Metro (Expo). Ignora a pasta `backend/` (API Node/Express) —
// ela não faz parte do bundle do app mobile/web.
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

const atual = config.resolver.blockList;
const existentes = Array.isArray(atual) ? atual : atual ? [atual] : [];
config.resolver.blockList = [...existentes, /[\\/]backend[\\/].*/];

module.exports = config;
