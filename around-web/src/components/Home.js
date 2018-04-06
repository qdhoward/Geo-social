import React from 'react';
import {Tabs, Spin} from 'antd';
import {TOKEN_KEY, GEO_OPTIONS, API_ROOT, AUTH_PREFIX, POS_KEY} from '../constants';
import { Gallery } from './Gallery';
import { WrappedAroundMap } from './AroundMap'
import { CreatePostButton } from './CreatePostButton';
import $ from 'jquery';
const TabPane = Tabs.TabPane;

export class Home extends React.Component {
    state = {
        loadingGeoLocation: false,
        loadingPosts: false,
        error: '',
        posts: []
    };

    getGeoLocation = () => {
        if ("geolocation" in navigator) {
            /* geolocation is available */
            navigator.geolocation.getCurrentPosition(this.onSuccessGetGeoLocation, this.onFailedGetGeoLocation, GEO_OPTIONS);
        } else {
            /* geolocation IS NOT available */
            this.setState({ error: 'Your browser does not support geolocation!' });
        }
    };

    onSuccessGetGeoLocation = (position) => {
        this.setState({loadingGeolocation: false, error: ''});
        console.log(position);
        const {latitude, longitude} = position.coords;
        localStorage.setItem(POS_KEY, JSON.stringify({lat: latitude, lon: longitude}));
        this.loadNearbyPosts();
    };

    onFailedGetGeoLocation = () => {
        this.setState({loadingGeolocation: false, error: 'Failed to load geo location'});
    };

    componentDidMount() {
        this.setState({loadingGeolocation: true});
        this.getGeoLocation();
    }

    getGalleryPanelContent = () => {
        if (this.state.error) {
            return <div>{this.state.error}</div>
        } else if (this.state.loadingGeolocation) {
            return <Spin tip="Loading GeoLocation"/>;
        } else if (this.state.loadingPosts) {
            return <Spin tip="Loading Posts"/>;
        } else if (this.state.posts && this.state.posts.length > 0) {
            const images = this.state.posts.map((post) => {
                return {
                    user: post.user,
                    src: post.url,
                    thumbnail: post.url,
                    thumbnailWidth: 400,
                    thumbnailHeight: 300,
                    caption: post.message,
                }
            });
            return <Gallery images={images}/>;
        } else {
            return <div>No images have been posted around this places.</div>
        }
    };

    loadNearbyPosts = (position, radius) => {
        // const lat = 37.535623;
        // const lon = -122.26956;
        const range = radius ? radius : 20;
        const { lat, lon } = position ? position : JSON.parse(localStorage.getItem(POS_KEY));
        this.setState({loadingPosts: true});
        return $.ajax({
            url: `${API_ROOT}/search?lat=${lat}&lon=${lon}&range=${range}`,
            method: 'GET',
            headers: {
                Authorization: `${AUTH_PREFIX} ${localStorage.getItem(TOKEN_KEY)}`
            }
        }).then((response) => {
            this.setState({ posts: response, loadingPosts: false, error: '' });
            console.log(response);
        }, (error) => {
            this.setState({loadingPosts: false, error: error.responseText});
            console.log(error);
        }).catch((error) => {
            console.log(error);
        });
    };

    render() {
        const createPostButton = <CreatePostButton loadNearbyPosts={this.loadNearbyPosts}/>;
        return (
            <Tabs tabBarExtraContent={createPostButton} className="main-tabs">
                <TabPane tab="Posts" key="1">
                    {this.getGalleryPanelContent()}
                </TabPane>
                <TabPane tab="Map" key="2">
                    <WrappedAroundMap
                        loadNearbyPosts={this.loadNearbyPosts}
                        posts={this.state.posts}
                        googleMapURL="https://maps.googleapis.com/maps/api/js?key=AIzaSyC4R6AN7SmujjPUIGKdyao2Kqitzr1kiRg&v=3.exp&libraries=geometry,drawing,places"
                        loadingElement={<div style={{ height: `100%` }} />}
                        containerElement={<div style={{ height: `400px` }} />}
                        mapElement={<div style={{ height: `100%` }} />}
                    />
                </TabPane>
            </Tabs>
        )
    };
}

