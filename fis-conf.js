/**
 * Created by jack on 16/7/19.
 */

fis.set('path', '');

fis.hook("commonjs", {
    extList: ['.js', '.vue']
});

fis.match('/{node_modules,src}/**', {
    isMod: true,
    useSameNameRequire: true
})

// 添加css和image加载支持
fis.match('**.{js,jsx,ts,tsx,es}', {
    preprocessor: [
        fis.plugin('js-require-css'),
        fis.plugin('js-require-file', {
            useEmbedWhenSizeLessThan: 10 * 1024 // 小于10k用base64
        })
    ]
});

var eslintConf = {
    ignoreFiles: ['node_modules/**', 'fis-conf.js'],
    envs: ['browser', 'node'],
    globals: ['$'],
    useEslintrc: true,
    rules: {
        semi: 0,
        'brace-style': [2, 'stroustrup'],
        indent: [2, 4, { 'SwitchCase': 1, 'VariableDeclarator': 1 }],
        'no-new': 0
    }
};

fis.match('/src/{*.js,**/*.js}', {
    lint: fis.plugin('eslint', eslintConf)
});

// vue组件中js片段处理。
fis.match('{**.vue:js,src/**.js}', {
    parser: fis.plugin('babel-5.x', {}, {
        presets: ["es2015", "react", "stage-0"]
    })
});

// vue组件本身配置
fis.match('**.vue', {
    isMod: true,
    rExt: '.js',
    useSameNameRequire: true,
    parser: fis.plugin('vue-component', {
        cssScopeFlag: 'vuec'
    })
});

// vue组件中的less片段处理
fis.match('{node_modules,src}/**.vue:less', {
    rExt: 'css',
    parser: fis.plugin('less')
});

fis.match('/{static,src}/**.less', {
    rExt: 'css',
    parser: fis.plugin('less')
});

fis.match('static/**/*', {
    release: fis.get('path') + '/$0'
});

fis.match('static/**.css',{
    optimizer: fis.plugin('clean-css')
});

fis.match('*.png', {
    // fis-optimizer-png-compressor 插件进行压缩，已内置
    optimizer: fis.plugin('png-compressor')
});

fis.match("src/(**)", {
    isMod: true,
    release: fis.get("path") + "/static/$1"
}).match("node_modules/**", {
    isMod: true,
    release: fis.get("path") + "/static/$0"
}).match("src/(*.html)", {
    release: fis.get("path") + "$1"
})

// 用 loader 来自动引入资源。
fis.match('::package', {
    postpackager: [fis.plugin('loader', {
        packager: fis.plugin('map')
    })]
});

fis.media("prod")
    .match('/static/**.js',{
        packTo:'/static/pkg/common.js',
        optimizer: fis.plugin('uglify-js')
    })
    .match('/static/js/mod.js',{
        packOrder:-100
    })
    .match('/static/js/jquery.js',{
        packOrder:-99
    })
    .match('/static/js/slimScroll/jquery.slimscroll.js',{
        packOrder:-98
    })
    .match('/static/js/app.js',{
        packOrder:0
    })
    .match('/{node_modules,src}/**.{vue,js}', {
        packTo: "/static/pkg/app.js",
        optimizer: fis.plugin('uglify-js')
    }).match('**/*.{css,less}', {
    packTo: '/static/pkg/all.css',
    optimizer: fis.plugin('clean-css')
}).match('/static/pkg/**',{
    useHash:true
});

fis.unhook('components');
fis.hook('node_modules');
