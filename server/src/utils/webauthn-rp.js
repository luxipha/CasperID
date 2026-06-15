function originCanUseRpId(origin, rpId) {
    if (!origin || !rpId) return false;

    let parsedOrigin;
    try {
        parsedOrigin = new URL(origin);
    } catch {
        return false;
    }

    const isSecureWebOrigin = parsedOrigin.protocol === 'https:';
    const isLocalhostDevelopment =
        rpId === 'localhost' &&
        parsedOrigin.protocol === 'http:' &&
        parsedOrigin.hostname === 'localhost';

    if (!isSecureWebOrigin && !isLocalhostDevelopment) return false;

    return parsedOrigin.hostname === rpId || parsedOrigin.hostname.endsWith(`.${rpId}`);
}

module.exports = { originCanUseRpId };
