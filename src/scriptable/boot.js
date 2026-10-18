const bootData = JSON.stringify({state:storedState,battery:deviceInfo.level,charging:deviceInfo.charging,recovery:stateRecovery});
const bootScript = '<script>window.__SCRIPTABLE__=true;window.__BOOT__='+bootData.replace(/</g,'\\u003c')+';<'+ '/script>';
const html = htmlSource.replace('<script>',bootScript+'<script>');
