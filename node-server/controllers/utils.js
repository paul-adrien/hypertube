

module.exports.checkParams = (req, res, params) => {
    return new Promise((fullfil, reject) => {
        params.forEach(param => {
            if (!req.body[param]) reject({ res: res, en_error: 'Fields missing', fr_error: 'Vous n\'avez pas fourni toutes les informations nécessaires' })
            else {
                if (param === 'login') {
                    var regex = /^([a-zA-Z0-9-_. ]){6,20}$/
                    if (!regex.test(req.body[param])) reject({ res: res, en_error: 'Login isn\'t well formated', fr_error: 'Le login n\'est pas correctement formaté' })
                }
                else if (param === 'password' || param === 'passwordConfirmation') {
                    var regex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/
                    if (!regex.test(req.body[param])) reject({ res: res, en_error: 'Password isn\'t well formated', fr_error: 'Le mot de passe n\'est pas correctement formaté' })
                }
                else if (param === 'email') {
                    var regex = /^([a-zA-Z0-9-_.]){3,40}@([a-zA-Z0-9-_.]){3,40}\.([a-zA-Z0-9-_.]){1,40}$/
                    if (!regex.test(req.body[param])) reject({ res: res, en_error: 'Email isn\'t well formated', fr_error: 'L\'email n\'est pas correctement formaté' })
                }
                else if (param === 'nlang') {
                    var regex = /^(fr|en)$/
                    if (!regex.test(req.body[param])) reject({ res: res, en_error: 'Unavailable language', fr_error: 'Langue indisponible' })
                }
                else if (param === 'avatar') {
                    if (req.body[param].mimetype !== 'image/jpeg' && req.body[param].mimetype !== 'image/png') reject({ res: res, en_error: 'Your picture must be jpg or png', fr_error: 'Votre photo doit être png/jpg' })
                    if (req.body[param].size > 250000) reject({ res: res, en_error: 'The size of the picture must be < 250kb', fr_error: 'Votre photo est trop grande (>250kb)' })
                }
                else if (param === 'with_genres') {
                    var regex = /^(-1|28|12|16|35|80|99|18|10751|14|27|10749|878|53|10752|37)$/
                    if (!regex.test(req.body[param])) reject({ res: res, en_error: 'Unavailable genre', fr_error: 'Genre indisponible' })
                }
                else if (param === 'language') {
                    var regex = /^(fr|en|ru|it|de|ja|pt|es)$/
                    if (!regex.test(req.body[param])) reject({ res: res, en_error: 'Unavailable language', fr_error: 'Langue indisponible' })
                }
                else if (param === 'vote_average') {
                    var regex = /^([0-9]|10)$/
                    if (!regex.test(req.body[param][0]) || !regex.test(req.body[param][1])) reject({ res: res, en_error: 'Average vote must be >= 0 && <= 10', fr_error: 'La popularité doit être >= 0 && <= 10' })
                }
                else if (param === 'release_date_min' || param === 'release_date_max') {
                    var regex = /^(19[8-9][0-9]|20[0-1][0-8])$/
                    if (!regex.test(req.body[param])) reject({ res: res, en_error: 'Release date must be >= 1950 && <= 2019', fr_error: 'La date de sortie doit être >= 1950 && <= 2019' })
                }
                else if (param === 'page') {
                    var regex = /^(1|[0-9]{0,2})$/
                    if (!regex.test(req.body[param])) reject({ res: res, en_error: 'Unavailable page', fr_error: 'Page indisponible/invalide' })
                }
                else if (param === 'hash') {
                    var regex = /^([a-zA-Z0-9]){40}$/
                    if (!regex.test(req.body[param])) reject({ res: res, en_error: 'Torrent\'s magnet isn\'t well formated', fr_error: 'Le magnet du torrent n\'est pas correctement formaté' })
                }
            }
        })
        fullfil({ res: res, params: req.body })
    })
}