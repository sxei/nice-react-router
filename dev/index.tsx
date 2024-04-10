import React from 'react';
import NiceReactRouter from '../src';

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
    componentDidMount(): void {
        
    }
    render() {
        return <div>
            <h1>
                公共headew
                <a href="javascript:;" onClick={() => history.push('/a')}>A</a>
                <a href="javascript:;" onClick={() => history.push('/b')}>B</a>
                <a href="javascript:;" onClick={() => history.push('/c')}>C</a>
            </h1>
            <RouterView />
        </div>
    }
}

