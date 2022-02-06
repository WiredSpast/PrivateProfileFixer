const { Extension, HDirection, HPacket, HUserProfile} = require('gnode-api');
const fetch = require('node-fetch');

let extensionInfo = require('./package.json');
extensionInfo.name = 'Private Profile Fixer';

const ext = new Extension(extensionInfo);
let hotel = "www.habbo.com";
ext.run();

ext.interceptByNameOrHash(HDirection.TOCLIENT, 'ExtendedProfile', onExtendedProfile);

ext.on('connect', (host, connectionPort, hotelVersion, clientIdentifier, clientType) => {
    switch(host) {
        case "game-nl.habbo.com":
            hotel = "www.habbo.nl";
            break;
        case "game-br.habbo.com":
            hotel = "www.habbo.com.br";
            break;
        case "game-tr.habbo.com":
            hotel = "www.habbo.com.tr";
            break;
        case "game-de.habbo.com":
            hotel = "www.habbo.de";
            break;
        case "game-fr.habbo.com":
            hotel = "www.habbo.fr";
            break;
        case "game-fi.habbo.com":
            hotel = "www.habbo.fi";
            break;
        case "game-es.habbo.com":
            hotel = "www.habbo.es";
            break;
        case "game-it.habbo.com":
            hotel = "www.habbo.it";
            break;
        case "game-s2.habbo.com":
            hotel = "sandbox.habbo.com";
            break;
        default:
            hotel = "www.habbo.com";
            break;
    }
});

const banned = {
    "www.habbo.com": "The account has been banned",
    "sandbox.habbo.com": "The account has been banned",
    "www.habbo.nl": "Deze account is gebanned",
    "www.habbo.de": "Der Account wurde gebannt",
    "www.habbo.fr": "Le compte a été exclu",
    "www.habbo.fi": "Tili on porttikiellossa",
    "www.habbo.es": "La cuenta ha sido baneada",
    "www.habbo.it": "L'account è stato bannato",
    "www.habbo.com.tr": "Bu Hesap Yasaklanmıştır",
    "www.habbo.com.br": "Essa conta está banida"
}

function onExtendedProfile(hMessage) {
    let profile = new HUserProfile(hMessage.getPacket());
    if(!profile.openProfile) {
        hMessage.blocked;
        fetch(`https://${hotel}/api/public/users?name=${profile.username}`)
            .then(res => res.json())
            .then(userJson => {
                if(!('error' in userJson)) {
                    profile.creationDate = userJson.memberSince.substring(0, 10).split('-').reverse().join('-');
                    profile.motto = userJson.motto;
                } else {
                    profile.motto = banned[hotel];
                }

                profile.openProfile = true;
                profile.friendCount = profile.friendCount < 0 ? 0 : profile.friendCount;
                profile.lastAccessSince = -1;

                ext.sendToClient(profile.constructPacket(hMessage.getPacket().headerId()));
            });
    }
}
