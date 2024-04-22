import React, { useEffect, useState } from 'react';

interface NiceReactRoute {
    path: string;
    component: any;
    redirect?: string;
    title?: string;
}

interface NiceReactRouterProps {
    /** 路由数组配置 */
    routes: NiceReactRoute[];
    /** 是否启用哈希模式，默认否（暂不支持） */
    hashMode?: boolean;
    /**
     * 路由跳转钩子
     * @param from 从哪个页面来，首次访问时为空
     * @param to 即将跳转的页面
     * @returns 返回 false 表示终止本次渲染，返回字符串则表示重定向到此地址
     */
    onRouterChange?: (from?: NiceReactRoute, to?: NiceReactRoute) => void | false | string;
    // beforeRouterChange?: () => any;
    // afterRouterChange?: () => any;
}

interface NiceReactRouterHistory {
    push: (path: string) => void;
    replace: (path: string) => void;
}

// 将一个路径转为http开头的绝对路径
const getAbsolutePath = (path: string) => {
    const al = document.createElement('a');
    al.href = path;
    return al.href;
};

// 将一个路径转为/开头的路径
const getRelativePath = (path: string) => {
    return getAbsolutePath(path).split('//').pop().replace(/^[^/]+/g, '');
};

let historyInstance: NiceReactRouterHistory = null;

export const getHistory = () => historyInstance;

export const RouterLink = (props: {
    /** 即将跳转的地址 */
    to?: string;
    children?: any;
    component?: keyof JSX.IntrinsicElements;
}) => {
    const { to, children, component: Comp, ..._props } = props;
    if (!Comp || Comp === 'a') {
        return <a href="javascript:;" onClick={() => getHistory()?.push(to)} {..._props}>{children}</a>;
    }
    return <Comp onClick={() => getHistory()?.push(to)} {..._props}>{children}</Comp>;
};

/**
 * 忍受不了react-router怪异的语法？
 * react-router提供的钩子不够用？
 * 嫌react-router太大太臃肿？
 * 来试试只有几十行代码的迷你router组件，采用配置化开发、不侵入JSX，同时支持history和hash模式，支持异步等待等特性；
 * @param {*} options 可选配置
 * @returns 返回 { RouterView, history }
 */
export default function NiceReactRouter(options: NiceReactRouterProps) {
    const defaultOptions: NiceReactRouterProps = {
        // 路由数组
        routes: [],
        // 是否启用hash模式，默认否
        hashMode: false,
        // URL跳转之前触发，可以利用这个钩子对跳转的地址做修改（注意，前进后退产生的变化不会触发这个钩子，一般不建议使用这个钩子）
        // beforeRouterChange: (path) => {},
        // URL变化之后触发，包括主动push和浏览器前进后退产生的变化，如果返回false表示终止页面渲染
        // afterRouterChange: (preRouter, currentRouter) => {},
        onRouterChange: () => {},
    };
    options = Object.assign({}, defaultOptions, options);
    if (!options?.routes?.length) {
        throw new Error('Options.routes can not be empty.');
    }
    const routerMap: any = {};
    let defaultRouter: NiceReactRoute = null;
    let preRouter: NiceReactRoute = null;
    options.routes.forEach(router => {
        if (router.path === '*') {
            defaultRouter = router;
        } else {
            routerMap[router.path] = router;
        }
    });
    let setRouter: any = null;
    const onChange = async () => {
        const path = options.hashMode ? location.hash.substring(1).split('?').shift() : location.pathname;
        const currentRouter = routerMap[path] || defaultRouter;
        const result = await options.onRouterChange(preRouter, currentRouter);
        if (result === false) {
            return;
        }
        if (typeof result === 'string') {
            history.replace(result);
            return;
        }
        setRouter && setRouter(currentRouter);
        currentRouter.href = location.href; // 插入完整URL记录
        preRouter = currentRouter;
    };
    // 前进后退监听
    window.addEventListener('popstate', e => {
        console.log('popstate', location, e.state);
        onChange();
    });
    const RouterView = () => {
        const [currentRouter, setCurrentRouter] = useState<NiceReactRoute>();
        setRouter = setCurrentRouter;
        useEffect(() => { onChange(); }, []);
        const Component = currentRouter?.component;
        return Component ? <Component /> : null;
    };
    const history = {
        push: (path: string) => {
            window.history.pushState({}, '', getRelativePath(path));
            onChange();
        },
        replace: (path: string) => {
            window.history.replaceState({}, '', getRelativePath(path));
            onChange();
        },
        // back: () => window.history.back(),
    };
    historyInstance = history;
    return {
        RouterView,
        history,
    };
}