---
sidebar_label: 用法
---

本 Demo 演示一行文字的用法。

```jsx preview
import NiceReactRouter from 'nice-react-router';
import styles from './usage.module.css';
import noop from './usage.js';

const routers = [
    { path: '/a', component: () => 'A页面', },
    { path: '/b', component: () => 'B页面', },
    { path: '*', component: () => '404页面', },
];
const { RouterView, history } = NiceReactRouter({
    routers,
    onRouterChange(from, to) {
        console.log('-----onRouterChange------', from, to);
    },
});
export default class extends React.Component {
    componentDidMount() {
        
    }
    render() {
        return <div>
            <h1>
                路由：
                <a href="javascript:;" onClick={() => history.push('/a')}>A</a>
                <a href="javascript:;" onClick={() => history.push('/b')}>B</a>
                <a href="javascript:;" onClick={() => history.push('/c')}>C</a>
            </h1>
            <RouterView />
        </div>
    }
}


```
