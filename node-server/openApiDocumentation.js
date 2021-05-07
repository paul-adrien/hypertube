module.exports = {
    openapi: '3.0.3',
    info: {
        version: '1',
        title: 'Hypertube API',
        description: '',
        contact: {
            name: 'Gguyot & Plaurent',
            email: 'paul.adrien.76@gmail.com'
        }
    },
    servers: [
        {
            url: 'http://localhost:8080/',
            description: 'Local server'
        }
    ],
    security: [
        {
            ApiKeyAuth: []
        }
    ],
    tags: [
        {
            name: 'CRUD operations'
        }
    ],
    paths: {
        '/token': {
            get: {
                tags: ['CRUD operations'],
                description: 'Check token',
                parameters: [
                    {
                        name: 'x-access-token',
                        in: 'header',
                        required: true,
                    }
                ],
                responses: {
                    'true': {
                        description: 'Users exist and send',
                        content: {
                            'application/json': {
                                example: {
                                    message: "user was log",
                                }
                            }
                        }
                    },
                    'false': {
                        description: 'Missing parameters',
                        content: {
                            'application/json': {
                                example: {
                                    message: "No token || unauthorized || user doesn't exist ",
                                }
                            }
                        }
                    }
                }
            }
        },
        '/user/:id': {
            get: {
                tags: ['CRUD operations'],
                description: 'Get user information',
                parameters: [
                    {
                        name: 'x-access-token',
                        in: 'header',
                        required: true,
                    },
                    {
                        name: 'user_id',
                        in: 'params',
                        schema: {
                            type: 'string',
                        },
                        required: true
                    }
                ],
                responses: {
                    'true': {
                        description: 'Users exist and send',
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: '#/components/schemas/User'
                                }
                            }
                        }
                    },
                    'false': {
                        description: 'Missing parameters',
                        content: {
                            'application/json': {
                                example: {
                                    message: "No token || unauthorized || user doesn't exist ",
                                }
                            }
                        }
                    }
                }
            },
            put: {
                tags: ['CRUD operations'],
                description: 'Update user',
                parameters: [
                    {
                        name: 'x-access-token',
                        in: 'header',
                        required: true,
                    },
                    {
                        name: 'user_id',
                        in: 'params',
                        schema: {
                            type: 'string',
                        },
                        required: true
                    }
                ],
                requestBody: {
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/User'
                            }
                        }
                    },
                    required: true
                },
                responses: {
                    'true': {
                        description: 'User update',
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: '#/components/schemas/User'
                                }
                            }
                        }
                    },
                    'false': {
                        description: 'Missing parameters',
                        content: {
                            'application/json': {
                                example: {
                                    message: "No token || unauthorized || user update error",
                                }
                            }
                        }
                    }
                }
            }
        },
        '/user/register': {
            post: {
                tags: ['CRUD operations'],
                description: 'Create user',
                parameters: [],
                requestBody: {
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/userRegsiter',
                            }
                        }
                    },
                    required: true
                },
                responses: {
                    'true': {
                        description: 'User was registered',
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: '#/components/schemas/User'
                                }
                            }
                        }
                    },
                    'false': {
                        description: 'Missing parameters',
                        content: {
                            'application/json': {
                                example: {
                                    message: "No token || unauthorized || Failed! Username is already in use! || Failed! Email is already in use! ",
                                }
                            }
                        }
                    }
                }
            }
        },
        '/user/authenticate': {
            post: {
                tags: ['CRUD operations'],
                description: 'login',
                parameters: [],
                requestBody: {
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/userAuthenticate',
                            }
                        }
                    },
                    required: true
                },
                responses: {
                    'true': {
                        description: 'User was registered',
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: '#/components/schemas/User',
                                    message: "sdfdsf"
                                }
                            }
                        }
                    },
                    'false': {
                        description: 'Missing parameters',
                        content: {
                            'application/json': {
                                example: {
                                    message: "No token || unauthorized || Invalid Password! || User Not found.",
                                }
                            }
                        }
                    }
                }
            }
        },
        '/user/authenticate/42': {
            get: {
                tags: ['CRUD operations'],
                description: 'login with 42 omniauth',
                parameters: [],
                responses: {
                }
            }
        },
        '/user/authenticate/google': {
            get: {
                tags: ['CRUD operations'],
                description: 'login with google omniauth',
                parameters: [],
                responses: {
                }
            }
        },
        '/user/authenticate/github': {
            get: {
                tags: ['CRUD operations'],
                description: 'login with github omniauth',
                parameters: [],
                responses: {
                }
            }
        },
        '/user/authenticate/42/callback': {
            get: {
                tags: ['CRUD operations'],
                description: 'callback login with 42 omniauth',
                parameters: [],
                responses: {
                }
            }
        },
        '/user/authenticate/google/callback': {
            get: {
                tags: ['CRUD operations'],
                description: 'callback login with google omniauth',
                parameters: [],
                responses: {
                }
            }
        },
        '/user/authenticate/github/callback': {
            get: {
                tags: ['CRUD operations'],
                description: 'callback login with github omniauth',
                parameters: [],
                responses: {
                }
            }
        },
        '/comment/:imdb_id': {
            get: {
                tags: ['CRUD operations'],
                description: 'get comment',
                parameters: [
                    {
                        name: 'x-access-token',
                        in: 'header',
                        required: true,
                    },
                ],
                requestBody: {
                },
                responses: {
                    'true': {
                        description: 'User was registered',
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: '#/components/schemas/Comments',
                                }
                            }
                        }
                    },
                    'false': {
                        description: 'Missing parameters',
                        content: {
                            'application/json': {
                                example: {
                                    message: "No token || unauthorized",
                                }
                            }
                        }
                    }
                }
            },
            post: {
                tags: ['CRUD operations'],
                description: 'send comment',
                parameters: [
                    {
                        name: 'x-access-token',
                        in: 'header',
                        required: true,
                    },
                ],
                requestBody: {
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/Comments',
                            }
                        }
                    },
                    required: true
                },
                responses: {
                    'true': {
                        description: 'User was registered',
                        content: {
                            'application/json': {
                                example: {
                                    message: " Comment was registered successfully!",
                                }
                            }
                        }
                    },
                    'false': {
                        description: 'Missing parameters',
                        content: {
                            'application/json': {
                                example: {
                                    message: "No token || unauthorized",
                                }
                            }
                        }
                    }
                }
            }
        },
        '/movie/list': {
            get: {
                tags: ['CRUD operations'],
                description: 'get movie list',
                parameters: [
                    {
                        name: 'x-access-token',
                        in: 'header',
                        required: true,
                    },
                    {
                        name: 'userId',
                        in: 'query',
                        schema: {
                            type: 'string',
                        },
                        required: true
                    },
                    {
                        name: 'genre',
                        in: 'query',
                        schema: {
                            type: 'string',
                        },
                        required: true
                    },
                    {
                        name: 'note',
                        in: 'query',
                        schema: {
                            type: 'string',
                        },
                        required: true
                    },
                    {
                        name: 'search',
                        in: 'query',
                        schema: {
                            type: 'string',
                        },
                        required: true
                    },
                    {
                        name: 'sort',
                        in: 'query',
                        schema: {
                            type: 'string',
                        },
                        required: true
                    },
                    {
                        name: 'order',
                        in: 'query',
                        schema: {
                            type: 'string',
                        },
                        required: true
                    }
                ],
                responses: {
                    'true': {
                        description: 'list of movies',
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: '#/components/schemas/Movies',
                                }
                            }
                        }
                    },
                    'false': {
                        description: 'Missing parameters',
                        content: {
                            'application/json': {
                                example: {
                                    message: "No token || unauthorized",
                                }
                            }
                        }
                    }
                }
            }
        },
        '/movie/:imdb_id/favorite': {
            post: {
                tags: ['CRUD operations'],
                description: 'get movie list',
                parameters: [
                    {
                        name: 'x-access-token',
                        in: 'header',
                        required: true,
                    },
                ],
                requestBody: {
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/Movies',
                            }
                        }
                    },
                    required: true
                },
                responses: {
                    'true': {
                        description: 'save favorite',
                        content: {
                            'application/json': {
                                example: {
                                    message: "Movie was registered successfully to favorite!",
                                }
                            }
                        }
                    },
                    'false': {
                        description: 'Missing parameters',
                        content: {
                            'application/json': {
                                example: {
                                    message: "No token || unauthorized",
                                }
                            }
                        }
                    }
                }
            }
        },
        '/movie/:imdb_id/favorite/:user_id': {
            delete: {
                tags: ['CRUD operations'],
                description: 'delete favorite',
                parameters: [
                    {
                        name: 'x-access-token',
                        in: 'header',
                        required: true,
                    },
                ],
                responses: {
                    'true': {
                        description: 'delete favorite',
                        content: {
                            'application/json': {
                                example: {
                                    message: "Movie was delete to favorite!",
                                }
                            }
                        }
                    },
                    'false': {
                        description: 'Missing parameters',
                        content: {
                            'application/json': {
                                example: {
                                    message: "No token || unauthorized",
                                }
                            }
                        }
                    }
                }
            }
        },
        '/movie/favorite/:user_id': {
            get: {
                tags: ['CRUD operations'],
                description: 'get favorite list',
                parameters: [
                    {
                        name: 'x-access-token',
                        in: 'header',
                        required: true,
                    },
                ],
                responses: {
                    'true': {
                        description: 'list of favorite',
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: '#/components/schemas/Movies',
                                }
                            }
                        }
                    },
                    'false': {
                        description: 'Missing parameters',
                        content: {
                            'application/json': {
                                example: {
                                    message: "No token || unauthorized",
                                }
                            }
                        }
                    }
                }
            }
        },
        '/movie/:imdb_id/subtitles': {
            post: {
                tags: ['CRUD operations'],
                description: 'download subtitles',
                parameters: [
                    {
                        name: 'x-access-token',
                        in: 'header',
                        required: true,
                    },
                ],
                responses: {
                    'true': {
                        description: '',
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: '#/components/schemas/Subtitles',
                                }
                            }
                        }
                    },
                    'false': {
                        description: 'Missing parameters',
                        content: {
                            'application/json': {
                                example: {
                                    message: "No token || unauthorized || no subs available",
                                }
                            }
                        }
                    }
                }
            }
        },
        '/movie/:imdb_id/subtitles/file/:lang': {
            get: {
                tags: ['CRUD operations'],
                description: 'get subtitles',
                parameters: [
                    {
                        name: 'x-access-token',
                        in: 'header',
                        required: true,
                    },
                ],
                responses: {
                    'true': {
                        description: 'list of favorite',
                        content: {
                            'application/json': {
                            }
                        }
                    },
                    'false': {
                        description: 'Missing parameters',
                        content: {
                            'application/json': {
                                example: {
                                    message: "No token || unauthorized || no subs available",
                                }
                            }
                        }
                    }
                }
            }
        },
        '/movie/:imdb_id/detail': {
            get: {
                tags: ['CRUD operations'],
                description: 'get movie detail',
                parameters: [
                    {
                        name: 'x-access-token',
                        in: 'header',
                        required: true,
                    },
                ],
                responses: {
                    'true': {
                        description: 'list of favorite',
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: '#/components/schemas/Detail'
                                }
                            }
                        }
                    },
                    'false': {
                        description: 'Missing parameters',
                        content: {
                            'application/json': {
                                example: {
                                    message: "No token || unauthorized || no subs available",
                                }
                            }
                        }
                    }
                }
            }
        },
        '/movie/download': {
            post: {
                tags: ['CRUD operations'],
                description: 'download a movie',
                parameters: [
                    {
                        name: 'token',
                        in: 'query',
                        required: true,
                    },
                ],
                requestBody: {
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/DownloadBody',
                            }
                        }
                    },
                    required: true
                },
                responses: {
                    '200': {
                        description: 'list of favorite',
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: '#/components/schemas/DownloadRes',
                                }
                            }
                        }
                    },
                    'false': {
                        description: 'Missing parameters',
                        content: {
                            'application/json': {
                                example: {
                                    message: "No token || unauthorized || no subs available",
                                }
                            }
                        }
                    }
                }
            }
        },
        '/movie/convert/:hash/:quality': {
            get: {
                tags: ['CRUD operations'],
                description: 'convert and stream torrent',
                parameters: [
                    {
                        name: 'x-access-token',
                        in: 'query',
                        required: true,
                    },
                ],
                responses: {
                    'true': {
                        description: '',
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: '#/components/schemas/Convert'
                                }
                            }
                        }
                    },
                    'false': {
                        description: 'Missing parameters',
                        content: {
                            'application/json': {
                                example: {
                                    message: "No token || unauthorized ",
                                }
                            }
                        }
                    }
                }
            }
        },
        '/movie/stream/:hash': {
            get: {
                tags: ['CRUD operations'],
                description: 'get movie detail',
                parameters: [
                    {
                        name: 'x-access-token',
                        in: 'query',
                        required: true,
                    },
                ],
                responses: {
                    'true': {
                        description: 'list of favorite',
                        content: {
                            'application/json': {
                            }
                        }
                    },
                    'false': {
                        description: 'Missing parameters',
                        content: {
                            'application/json': {
                                example: {
                                    message: "No token || unauthorized",
                                }
                            }
                        }
                    }
                }
            }
        },
    },
    components: {
        schemas: {
            userName: {
                type: 'string',
                example: 'paul'
            },
            email: {
                type: 'string',
                example: 'paul@gmail.com'
            },
            lastName: {
                type: 'string',
                example: 'laurent'
            },
            firstName: {
                type: 'string',
                example: 'paul'
            },
            password: {
                type: 'string',
                example: 'gkjHK56f-hGK'
            },
            comment: {
                type: 'string',
                example: 'Nice !'
            },
            date: {
                type: 'string'
            },
            imdb_id: {
                type: 'string'
            },
            id: {
                type: 'string'
            },
            picture: {
                type: 'string'
            },
            moviesWatched: {
                type: 'array',
                items: {
                    type: 'string'
                }
            },
            Convert: {
                type: 'object',
                properties: {
                    res: {
                        type: 'object'
                    },
                    params: {
                        type: 'object'
                    },
                    token: {
                        type: 'string'
                    }
                }
            },
            DownloadRes: {
                type: 'object',
                properties: {
                    config: {
                        type: 'object'
                    },
                    data: {
                        type: 'object'
                    },
                    headers: {
                        type: 'object'
                    },
                    request: {
                        type: 'object'
                    }
                }
            },
            DownloadBody: {
                type: 'object',
                properties: {
                    hash: {
                        type: 'string'
                    },
                    movieId: {
                        type: 'string'
                    },
                    size: {
                        type: 'number'
                    },
                    quality: {
                        type: 'string'
                    },
                    userId: {
                        type: 'number'
                    }
                }
            },
            Hashs: {
                type: 'object',
                properties: {
                    hash: {
                        type: 'string'
                    },
                    imdb_code: {
                        type: 'string'
                    },
                    peers: {
                        type: 'number'
                    },
                    quality: {
                        type: 'string'
                    },
                    seeds: {
                        type: 'number'
                    },
                    size: {
                        type: 'number'
                    },
                    source: {
                        type: 'string'
                    },
                    state: {
                        type: 'boolean'
                    }
                }
            },
            MovieDetail: {
                type: 'object',
                properties: {
                    actors: {
                        type: 'string'
                    },
                    author: {
                        type: 'string'
                    },
                    boxoffice: {
                        type: 'string'
                    },
                    director: {
                        type: 'string'
                    },
                    genre: {
                        type: 'string'
                    },
                    imdb_code: {
                        type: 'string'
                    },
                    metascore: {
                        type: 'string'
                    },
                    poster: {
                        type: 'string'
                    },
                    production: {
                        type: 'string'
                    },
                    rating: {
                        type: 'number'
                    },
                    resume: {
                        type: 'string'
                    },
                    runtime: {
                        type: 'string'
                    },
                    title: {
                        type: 'string'
                    },
                    year: {
                        type: 'number'
                    }
                }
            },
            Detail: {
                type: 'object',
                properties: {
                    hashs: {
                        type: 'object',
                        properties: {
                            schema: {
                                $ref: '#/components/schemas/Hashs'
                            }
                        }
                    },
                    movieDetail: {
                        type: 'object',
                        properties: {
                            schema: {
                                $ref: '#/components/schemas/MovieDetail'
                            }
                        }
                    }
                }
            },
            Subtitles: {
                type: 'object',
                properties: {
                    lang: {
                        type: 'string'
                    },
                    langShort: {
                        type: 'string'
                    },
                    path: {
                        type: 'string'
                    },
                    fileName: {
                        type: 'string'
                    }
                }
            },
            Movies: {
                type: 'object',
                properties: {
                    fav: {
                        type: 'boolean'
                    },
                    imdb_code: {
                        type: 'string'
                    },
                    poster: {
                        type: 'string'
                    },
                    rating: {
                        type: 'number',
                    },
                    runtime: {
                        type: 'string',
                    },
                    see: {
                        type: 'boolean',
                    },
                    seeds: {
                        type: 'number',
                    },
                    title: {
                        type: 'string',
                    },
                    year: {
                        type: 'number',
                    }
                }
            },
            Comments: {
                type: 'object',
                properties: {
                    username: {
                        $ref: '#/components/schemas/userName'
                    },
                    comment: {
                        $ref: '#/components/schemas/comment'
                    },
                    imdb_id: {
                        $ref: '#/components/schemas/imdb_id'
                    },
                    date: {
                        $ref: '#/components/schemas/date'
                    }
                }
            },
            userRegsiter: {
                type: 'object',
                properties: {
                    userName: {
                        $ref: '#/components/schemas/userName'
                    },
                    email: {
                        $ref: '#/components/schemas/email'
                    },
                    lastName: {
                        $ref: '#/components/schemas/lastName'
                    },
                    firstName: {
                        $ref: '#/components/schemas/firstName'
                    },
                    password: {
                        $ref: '#/components/schemas/password'
                    }
                }
            },
            userAuthenticate: {
                type: 'object',
                properties: {
                    userName: {
                        $ref: '#/components/schemas/userName'
                    },
                    password: {
                        $ref: '#/components/schemas/password'
                    }
                }
            },
            User: {
                type: 'object',
                properties: {
                    userName: {
                        $ref: '#/components/schemas/userName'
                    },
                    email: {
                        $ref: '#/components/schemas/email'
                    },
                    lastName: {
                        $ref: '#/components/schemas/lastName'
                    },
                    firstName: {
                        $ref: '#/components/schemas/firstName'
                    },
                    password: {
                        $ref: '#/components/schemas/password'
                    },
                    id: {
                        $ref: '#/components/schemas/id'
                    },
                    picture: {
                        $ref: '#/components/schemas/picture'
                    },
                    moviesWatched: {
                        $ref: '#/components/schemas/moviesWatched'
                    }
                }
            },
        },
        securitySchemes: {
            ApiKeyAuth: {
                type: 'apiKey',
                in: 'header',
                name: 'x-access-token'
            }
        }
    }
};