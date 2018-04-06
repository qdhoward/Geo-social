import React from 'react';
import { withScriptjs, withGoogleMap, GoogleMap } from 'react-google-maps'
import { AroundMarker } from './AroundMarker'
import { POS_KEY } from '../constants'

class AroundMap extends React.Component {
    reloadMarkers = ()=> {
        const center = this.map.getCenter();
        const position = { lat: center.lat(), lon: center.lng() };
        this.props.loadNearbyPosts(position, this.getRange());
    };

    getRange = () => {
        const google = window.google;
        const center = this.map.getCenter();
        const bounds = this.map.getBounds();
        if (center && bounds) {
            const ne = bounds.getNorthEast();
            const right = new google.maps.LatLng(center.lat(), ne.lng());
            return 0.000621371192 * google.maps.geometry.spherical.computeDistanceBetween(center, right);
        }
    };

    getMapRef = (map) => {
        this.map = map;
    };

    render() {
        const pos = JSON.parse(localStorage.getItem(POS_KEY));
        return (
            <GoogleMap
                ref={this.getMapRef}
                onDragEnd={this.reloadMarkers}
                onZoomChanged={this.reloadMarkers}
                defaultZoom={12}
                defaultCenter={{ lat: pos.lat, lng: pos.lon }}
            >
                {this.props.posts ? this.props.posts.map((post) => <AroundMarker key={`${post.url}`} post={post}/>) : null}
            </GoogleMap>
        );
    }
}

export const WrappedAroundMap = withScriptjs(withGoogleMap(AroundMap));