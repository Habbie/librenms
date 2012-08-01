/*
 Copyright (c) 2012, Smartrak, David Leaver
 Leaflet.markercluster is an open-source JavaScript library for Marker Clustering on leaflet powered maps.
 https://github.com/danzel/Leaflet.markercluster
*/
(function(e,t){L.MarkerClusterGroup=L.FeatureGroup.extend({options:{maxClusterRadius:60,iconCreateFunction:null,spiderfyOnMaxZoom:!0,showCoverageOnHover:!0,zoomToBoundsOnClick:!0},initialize:function(e){L.Util.setOptions(this,e),this.options.iconCreateFunction||(this.options.iconCreateFunction=this._defaultIconCreateFunction),L.FeatureGroup.prototype.initialize.call(this,[]),this._inZoomAnimation=0,this._needsClustering=[],this._currentShownBounds=null},addLayer:function(e){if(!this._map)return this._needsClustering.push(e),this;this._unspiderfy&&this._unspiderfy();var t=this._topClusterLevel._recursivelyAddLayer(e,this._topClusterLevel._zoom-1);return this._animationAddLayer(e,t),this},removeLayer:function(e){this._unspiderfy&&(this._unspiderfy(),this._unspiderfyLayer(e));if(!this._topClusterLevel._recursivelyRemoveLayer(e))var t=0;return this},onAdd:function(e){L.FeatureGroup.prototype.onAdd.call(this,e),this._topClusterLevel||this._generateInitialClusters(),this._map.on("zoomend",this._zoomEnd,this),this._map.on("moveend",this._moveEnd,this),this._spiderfierOnAdd&&this._spiderfierOnAdd(),this._bindEvents()},onRemove:function(e){this._map.off("zoomend",this._zoomEnd,this),this._map.off("moveend",this._moveEnd,this),this._spiderfierOnRemove&&this._spiderfierOnRemove(),L.FeatureGroup.prototype.onRemove.call(this,e)},_propagateEvent:function(e){e.target instanceof L.MarkerCluster&&(e.type="cluster"+e.type),L.FeatureGroup.prototype._propagateEvent.call(this,e)},_defaultIconCreateFunction:function(e){var t=" marker-cluster-";return e<10?t+="small":e<100?t+="medium":t+="large",new L.DivIcon({html:"<div><span>"+e+"</span></div>",className:"marker-cluster"+t,iconSize:new L.Point(40,40)})},_bindEvents:function(){var e=null,t=this._map,n=this.options.spiderfyOnMaxZoom,r=this.options.showCoverageOnHover,i=this.options.zoomToBoundsOnClick;(n||i)&&this.on("clusterclick",function(e){t.getMaxZoom()===t.getZoom()?n&&e.layer.spiderfy():i&&e.layer.zoomToBounds()},this),r&&(this.on("clustermouseover",function(n){if(this._inZoomAnimation)return;e&&t.removeLayer(e),n.layer.getChildCount()>2&&(e=new L.Polygon(n.layer.getConvexHull()),t.addLayer(e))},this),this.on("clustermouseout",function(){e&&(t.removeLayer(e),e=null)},this),t.on("zoomend",function(){e&&(t.removeLayer(e),e=null)},this))},_sqDist:function(e,t){var n=t.x-e.x,r=t.y-e.y;return n*n+r*r},_zoomEnd:function(){this._mergeSplitClusters(),this._zoom=this._map._zoom,this._currentShownBounds=this._getExpandedVisibleBounds()},_moveEnd:function(){if(this._inZoomAnimation)return;var e=this._getExpandedVisibleBounds(),t=this._zoom-this._topClusterLevel._zoom;this._topClusterLevel._recursivelyRemoveChildrenFromMap(this._currentShownBounds,t,e),this._topClusterLevel._recursivelyAddChildrenToMap(null,t+1,e),this._currentShownBounds=e;return},_generateInitialClusters:function(){var e=this._map.getMinZoom(),t=this._map.getMaxZoom(),n=this._map.getZoom();this._topClusterLevel=this._clusterToMarkerCluster(this._needsClustering,t);while(e<this._topClusterLevel._zoom)this._topClusterLevel=this._clusterToMarkerCluster(this._topClusterLevel._childClusters.concat(this._topClusterLevel._markers),this._topClusterLevel._zoom-1);this._zoom=n,this._currentShownBounds=this._getExpandedVisibleBounds(),this._topClusterLevel._recursivelyAddChildrenToMap(null,n-e+1,this._currentShownBounds)},_mergeSplitClusters:function(){this._zoom<this._map._zoom?(this._animationStart(),this._topClusterLevel._recursivelyRemoveChildrenFromMap(this._currentShownBounds,this._zoom-this._topClusterLevel._zoom,this._getExpandedVisibleBounds()),this._animationZoomIn(this._zoom,this._map._zoom)):this._zoom>this._map._zoom?(this._animationStart(),this._animationZoomOut(this._zoom,this._map._zoom)):this._moveEnd()},_clusterOne:function(e,t,n){var r=t._projCenter||this._map.project(t.getLatLng(),n),i=2*this.options.maxClusterRadius*2*this.options.maxClusterRadius,s,o,u;for(s=e.length-1;s>=0;s--){o=e[s],u=o._projCenter||this._map.project(o.getLatLng(),n);if(this._sqDist(r,u)<=i){var a=new L.MarkerCluster(this,o,t);return delete o._projCenter,delete t._projCenter,e.splice(s,1),a}}return null},_cluster:function(e,t){var n=this.options.maxClusterRadius*this.options.maxClusterRadius,r=[],i=[],s,o,u;for(s=e.length-1;s>=0;s--){var a=e[s],f=!1;a._projCenter=this._map.project(a.getLatLng(),t);for(o=r.length-1;o>=0;o--){u=r[o];if(this._sqDist(a._projCenter,u._projCenter)<=n){u._addChild(a),delete a._projCenter,u._projCenter=this._map.project(u.getLatLng(),t),f=!0;break}}if(!f){var l=this._clusterOne(i,a);l?(l._projCenter=this._map.project(l.getLatLng(),t),r.push(l)):i.push(a)}}for(s=i.length-1;s>=0;s--){u=i[s],delete u._projCenter;if(u instanceof L.MarkerCluster){var c=new L.MarkerCluster(this,u);c._haveGeneratedChildClusters=!0,r.push(c),i.splice(s,1)}}for(s=r.length-1;s>=0;s--)delete r[s]._projCenter,r[s]._baseInit();return{clusters:r,unclustered:i}},_clusterToMarkerCluster:function(e,t){var n=this._cluster(e,t),r=n.clusters.concat(n.unclustered),i=new L.MarkerCluster(this),s;for(s=r.length-1;s>=0;s--)i._addChild(r[s]);return i._zoom=t,i._haveGeneratedChildClusters=!0,i},_getExpandedVisibleBounds:function(){var e=this._map,t=e.getPixelBounds(),n=L.Browser.mobile?0:Math.abs(t.max.x-t.min.x),r=L.Browser.mobile?0:Math.abs(t.max.y-t.min.y),i=e.unproject(new L.Point(t.min.x-n,t.min.y-r)),s=e.unproject(new L.Point(t.max.x+n,t.max.y+r));return new L.LatLngBounds(i,s)}}),L.MarkerClusterGroup.include(L.DomUtil.TRANSITION?{_animationStart:function(){this._map._mapPane.className+=" leaflet-cluster-anim",this._inZoomAnimation++},_animationEnd:function(){this._map._mapPane.className=this._map._mapPane.className.replace(" leaflet-cluster-anim",""),this._inZoomAnimation--},_animationZoomIn:function(e,t){var n=this,r=this._getExpandedVisibleBounds(),i,s=1+e-this._topClusterLevel._zoom,o=t-e;this._topClusterLevel._recursively(r,s,0,function(e){var t=e._latlng,s=e._markers,u;e._isSingleParent()&&o===1?(L.FeatureGroup.prototype.removeLayer.call(n,e),e._recursivelyAddChildrenToMap(null,o,r)):(e.setOpacity(0),e._recursivelyAddChildrenToMap(t,o,r));for(i=s.length-1;i>=0;i--)u=s[i],r.contains(u._latlng)||L.FeatureGroup.prototype.removeLayer.call(n,u)}),this._forceLayout();var u,a;n._topClusterLevel._recursivelyBecomeVisible(r,s+o);for(u in n._layers)n._layers.hasOwnProperty(u)&&(a=n._layers[u],!(a instanceof L.MarkerCluster)&&a._icon&&a.setOpacity(1));n._topClusterLevel._recursively(r,s,0,function(e){e._recursivelyRestoreChildPositions(o)}),setTimeout(function(){n._topClusterLevel._recursively(r,s,0,function(e){L.FeatureGroup.prototype.removeLayer.call(n,e)}),n._animationEnd()},250)},_animationZoomOut:function(e,t){var n=1+t-this._topClusterLevel._zoom,r=e-t;this._animationZoomOutSingle(this._topClusterLevel,n,r),this._topClusterLevel._recursivelyAddChildrenToMap(null,n,this._getExpandedVisibleBounds())},_animationZoomOutSingle:function(e,t,n){var r=this._getExpandedVisibleBounds();e._recursivelyAnimateChildrenInAndAddSelfToMap(r,t,n);var i=this;this._forceLayout(),e._recursivelyBecomeVisible(r,t),setTimeout(function(){e._recursively(r,t,0,null,function(e){e._recursivelyRemoveChildrenFromMap(r,n-1)}),i._animationEnd()},250)},_animationAddLayer:function(e,t){var n=this;L.FeatureGroup.prototype.addLayer.call(this,e),t!==!0&&(t._childCount>2?(this._forceLayout(),this._animationStart(),e._setPos(this._map.latLngToLayerPoint(t.getLatLng())),e.setOpacity(0),setTimeout(function(){L.FeatureGroup.prototype.removeLayer.call(n,e),e.setOpacity(1),n._animationEnd()},250)):(this._forceLayout(),n._animationStart(),n._animationZoomOutSingle(t,0,this._map.getMaxZoom())))},_forceLayout:function(){L.Util.falseFn(document.body.offsetWidth)}}:{_animationStart:function(){},_animationZoomIn:function(e,t){this._topClusterLevel._recursivelyRemoveChildrenFromMap(this._currentShownBounds,e-this._topClusterLevel._zoom),this._topClusterLevel._recursivelyAddChildrenToMap(null,t-this._topClusterLevel._zoom+1,this._getExpandedVisibleBounds())},_animationZoomOut:function(e,t){this._topClusterLevel._recursivelyRemoveChildrenFromMap(this._currentShownBounds,e-this._topClusterLevel._zoom),this._topClusterLevel._recursivelyAddChildrenToMap(null,t-this._topClusterLevel._zoom+1,this._getExpandedVisibleBounds())},_animationAddLayer:function(e,t){t===!0?L.FeatureGroup.prototype.addLayer.call(this,e):t._childCount===2&&(t._addToMap(),t._recursivelyRemoveChildrenFromMap(t._bounds,this._map.getMaxZoom()))}}),L.MarkerCluster=L.Marker.extend({initialize:function(e,t,n){this._group=e,this._markers=[],this._childClusters=[],this._childCount=0,this._bounds=new L.LatLngBounds,t&&this._addChild(t),n&&this._addChild(n)},getAllChildMarkers:function(e){e=e||[];for(var t=this._childClusters.length-1;t>=0;t--)this._childClusters[t].getAllChildMarkers(e);for(var n=this._markers.length-1;n>=0;n--)e.push(this._markers[n]);return e},getChildCount:function(){return this._childCount},zoomToBounds:function(){this._group._map.fitBounds(this._bounds)},_baseInit:function(){L.Marker.prototype.initialize.call(this,this._latlng,{icon:this._group.options.iconCreateFunction(this._childCount)})},_addChild:function(e){e instanceof L.MarkerCluster?(this._childClusters.push(e),this._childCount+=e._childCount):(this._markers.push(e),this._childCount++),this._icon&&this.setIcon(this._group.options.iconCreateFunction(this._childCount)),this._expandBounds(e)},_expandBounds:function(e){e instanceof L.MarkerCluster?this._bounds.extend(e._bounds):this._bounds.extend(e.getLatLng()),this._latlng=this._bounds.getCenter()},_addToMap:function(e){e&&(this._backupLatlng=this._latlng,this.setLatLng(e)),L.FeatureGroup.prototype.addLayer.call(this._group,this)},_recursivelyAddLayer:function(e,t){var n=!1;for(var r=this._childClusters.length-1;r>=0;r--){var i=this._childClusters[r];if(i._bounds.contains(e.getLatLng())||i._canAcceptPosition(e.getLatLng(),t+1)){n=i._recursivelyAddLayer(e,t+1);if(n){this._childCount++;break}}}if(!n&&(this._canAcceptPosition(e.getLatLng(),t)||this._zoom)){n=this._group._clusterOne(this._markers,e,t+1);if(n){n._baseInit(),this._childCount--,this._addChild(n);var s=this._group._map.getZoom()-1,o=this._group._map.getMaxZoom(),u,a=t===s?n:!0;while(t<o){t++,u=this._group._clusterOne([n._markers[0]],e,t+1);if(u===null)break;u._baseInit(),n._markers=[],n._childClusters.push(u),n=u,t===s&&(a=n)}n=a}else this._addChild(e),n=!0}return n&&("_zoom"in this||this.setIcon(this._group.options.iconCreateFunction(this._childCount)),this._recalculateBounds()),n===!0&&this._icon&&(n=this),n},_canAcceptPosition:function(e,t){if(this._childCount===0)return!0;var n=this._group.options.maxClusterRadius*this._group.options.maxClusterRadius,r=this._group._map.project(this._latlng,t),i=this._group._map.project(e,t);return this._group._sqDist(r,i)<=n},_recursivelyRemoveLayer:function(e){var t=this._group,n=this._markers,r=this._childClusters,i;for(i=n.length-1;i>=0;i--)if(n[i]===e)return n[i]._icon&&L.FeatureGroup.prototype.removeLayer.call(t,n[i]),n.splice(i,1),this._childCount--,this._recalculateBounds(),"_zoom"in this||this.setIcon(t.options.iconCreateFunction(this._childCount)),!0;for(i=r.length-1;i>=0;i--){var s=r[i];if(s._bounds.contains(e._latlng)&&s._recursivelyRemoveLayer(e))return this._childCount--,"_zoom"in this||this.setIcon(t.options.iconCreateFunction(this._childCount)),s._childCount===1&&(s._icon&&(L.FeatureGroup.prototype.removeLayer.call(t,s),L.FeatureGroup.prototype.addLayer.call(t,s._markers[0])),n.push(s._markers[0]),r.splice(i,1)),this._recalculateBounds(),this._icon&&this._childCount>1&&this.setIcon(t.options.iconCreateFunction(this._childCount)),!0}return!1},_recursivelyAnimateChildrenIn:function(e,t,n){this._recursively(e,0,n-1,function(e){var n=e._markers,r,i;for(r=n.length-1;r>=0;r--)i=n[r],i._icon&&(i._setPos(t),i.setOpacity(0))},function(e){var n=e._childClusters,r,i;for(r=n.length-1;r>=0;r--)i=n[r],i._icon&&(i._setPos(t),i.setOpacity(0))})},_recursivelyAnimateChildrenInAndAddSelfToMap:function(e,t,n){this._recursively(e,t,0,function(t){t._recursivelyAnimateChildrenIn(e,t._group._map.latLngToLayerPoint(t.getLatLng()).round(),n),t._isSingleParent()&&n===1?(t.setOpacity(1),t._recursivelyRemoveChildrenFromMap(e,n-1)):t.setOpacity(0),t._addToMap()})},_recursivelyBecomeVisible:function(e,t){this._recursively(e,0,t,null,function(e){e.setOpacity(1)})},_recursivelyAddChildrenToMap:function(e,t,n){this._recursively(n,0,t,function(t,r){if(r===0)return;for(var i=t._markers.length-1;i>=0;i--){var s=t._markers[i];if(!n.contains(s._latlng))continue;e&&(s._backupLatlng=s.getLatLng(),s.setLatLng(e),s.setOpacity(0)),L.FeatureGroup.prototype.addLayer.call(t._group,s)}},function(t){t._addToMap(e)})},_recursivelyRestoreChildPositions:function(e){for(var t=this._markers.length-1;t>=0;t--){var n=this._markers[t];n._backupLatlng&&(n.setLatLng(n._backupLatlng),delete n._backupLatlng)}if(e===1)for(var r=this._childClusters.length-1;r>=0;r--)this._childClusters[r]._restorePosition();else for(var i=this._childClusters.length-1;i>=0;i--)this._childClusters[i]._recursivelyRestoreChildPositions(e-1)},_restorePosition:function(){this._backupLatlng&&(this.setLatLng(this._backupLatlng),delete this._backupLatlng)},_recursivelyRemoveChildrenFromMap:function(e,t,n){var r,i;this._recursively(e,0,t,function(e){for(i=e._markers.length-1;i>=0;i--){r=e._markers[i];if(!n||!n.contains(r._latlng))L.FeatureGroup.prototype.removeLayer.call(e._group,r),r.setOpacity(1)}},function(e){for(i=e._childClusters.length-1;i>=0;i--){r=e._childClusters[i];if(!n||!n.contains(r._latlng))L.FeatureGroup.prototype.removeLayer.call(e._group,r),r.setOpacity(1)}})},_recursively:function(e,t,n,r,i){var s=this._childClusters,o,u;if(t>0)for(o=s.length-1;o>=0;o--)u=s[o],e.intersects(u._bounds)&&u._recursively(e,t-1,n,r,i);else{r&&r(this,n),n===0&&i&&i(this);if(n>0)for(o=s.length-1;o>=0;o--)u=s[o],e.intersects(u._bounds)&&u._recursively(e,t,n-1,r,i)}},_recalculateBounds:function(){var e=this._markers,t=this._childClusters,n;this._bounds=new L.LatLngBounds;for(n=e.length-1;n>=0;n--)this._bounds.extend(e[n].getLatLng());for(n=t.length-1;n>=0;n--)this._bounds.extend(t[n]._bounds);this._childCount===0?delete this._latlng:this.setLatLng(this._bounds.getCenter())},_isSingleParent:function(){return this._childClusters.length>0&&this._childClusters[0]._childCount===this._childCount}}),function(){L.QuickHull={getDistant:function(e,t){var n=t[1].lat-t[0].lat,r=t[0].lng-t[1].lng;return r*(e.lat-t[0].lat)+n*(e.lng-t[0].lng)},findMostDistantPointFromBaseLine:function(e,t){var n=0,r=null,i=[],s,o,u;for(s=t.length-1;s>=0;s--){o=t[s],u=this.getDistant(o,e);if(!(u>0))continue;i.push(o),u>n&&(n=u,r=o)}return{maxPoint:r,newPoints:i}},buildConvexHull:function(e,t){var n=[],r=this.findMostDistantPointFromBaseLine(e,t);return r.maxPoint?(n=n.concat(this.buildConvexHull([e[0],r.maxPoint],r.newPoints)),n=n.concat(this.buildConvexHull([r.maxPoint,e[1]],r.newPoints)),n):[e]},getConvexHull:function(e){var t=!1,n=!1,r=null,i=null,s;for(s=e.length-1;s>=0;s--){var o=e[s];if(t===!1||o.lat>t)r=o,t=o.lat;if(n===!1||o.lat<n)i=o,n=o.lat}var u=[].concat(this.buildConvexHull([i,r],e),this.buildConvexHull([r,i],e));return u}}}(),L.MarkerCluster.include({getConvexHull:function(){var e=this.getAllChildMarkers(),t=[],n=[],r,i,s;for(s=e.length-1;s>=0;s--)i=e[s].getLatLng(),t.push(i);r=L.QuickHull.getConvexHull(t);for(s=r.length-1;s>=0;s--)n.push(r[s][0]);return n}}),L.MarkerCluster.include({_2PI:Math.PI*2,_circleFootSeparation:25,_circleStartAngle:Math.PI/6,_spiralFootSeparation:28,_spiralLengthStart:11,_spiralLengthFactor:5,_circleSpiralSwitchover:9,spiderfy:function(){if(this._group._spiderfied===this||this._group._inZoomAnimation)return;var e=this.getAllChildMarkers(),t=this._group,n=t._map,r=n.latLngToLayerPoint(this._latlng),i;this._group._unspiderfy(),this._group._spiderfied=this,e.length>=this._circleSpiralSwitchover?i=this._generatePointsSpiral(e.length,r):(r.y+=10,i=this._generatePointsCircle(e.length,r)),this._animationSpiderfy(e,i)},unspiderfy:function(){if(this._group._inZoomAnimation)return;this._animationUnspiderfy(),this._group._spiderfied=null},_generatePointsCircle:function(e,t){var n=this._circleFootSeparation*(2+e),r=n/this._2PI,i=this._2PI/e,s=[],o,u;s.length=e;for(o=e-1;o>=0;o--)u=this._circleStartAngle+o*i,s[o]=(new L.Point(t.x+r*Math.cos(u),t.y+r*Math.sin(u)))._round();return s},_generatePointsSpiral:function(e,t){var n=this._spiralLengthStart,r=0,i=[],s;i.length=e;for(s=e-1;s>=0;s--)r+=this._spiralFootSeparation/n+s*5e-4,i[s]=(new L.Point(t.x+n*Math.cos(r),t.y+n*Math.sin(r)))._round(),n+=this._2PI*this._spiralLengthFactor/r;return i}}),L.MarkerCluster.include(L.DomUtil.TRANSITION?{_animationSpiderfy:function(e,t){var n=this,r=this._group,i=r._map,s=i.latLngToLayerPoint(this._latlng),o,u,a,f;for(o=e.length-1;o>=0;o--)u=e[o],u.setZIndexOffset(1e6),u.setOpacity(0),L.FeatureGroup.prototype.addLayer.call(r,u),u._setPos(s);r._forceLayout(),r._animationStart();var l=L.Browser.svg?0:.3,c=L.Path.SVG_NS;for(o=e.length-1;o>=0;o--){f=i.layerPointToLatLng(t[o]),u=e[o],u._preSpiderfyLatlng=u._latlng,u.setLatLng(f),u.setOpacity(1),a=new L.Polyline([n._latlng,f],{weight:1.5,color:"#222",opacity:l}),i.addLayer(a),u._spiderLeg=a;if(!L.Browser.svg)continue;var h=a._path.getTotalLength();a._path.setAttribute("stroke-dasharray",h+","+h);var p=document.createElementNS(c,"animate");p.setAttribute("attributeName","stroke-dashoffset"),p.setAttribute("begin","indefinite"),p.setAttribute("from",h),p.setAttribute("to",0),p.setAttribute("dur",.25),a._path.appendChild(p),p.beginElement(),p=document.createElementNS(c,"animate"),p.setAttribute("attributeName","stroke-opacity"),p.setAttribute("attributeName","stroke-opacity"),p.setAttribute("begin","indefinite"),p.setAttribute("from",0),p.setAttribute("to",.5),p.setAttribute("dur",.25),a._path.appendChild(p),p.beginElement()}n.setOpacity(.3);if(L.Browser.svg){this._group._forceLayout();for(o=e.length-1;o>=0;o--)u=e[o]._spiderLeg,u.options.opacity=.5,u._path.setAttribute("stroke-opacity",.5)}setTimeout(function(){r._animationEnd()},250)},_animationUnspiderfy:function(){var e=this._group,t=e._map,n=t.latLngToLayerPoint(this._latlng),r=this.getAllChildMarkers(),i=L.Browser.svg,s,o,u;e._animationStart(),this.setOpacity(1);for(o=r.length-1;o>=0;o--)s=r[o],s.setLatLng(s._preSpiderfyLatlng),delete s._preSpiderfyLatlng,s._setPos(n),s.setOpacity(0),i&&(u=s._spiderLeg._path.childNodes[0],u.setAttribute("to",u.getAttribute("from")),u.setAttribute("from",0),u.beginElement(),u=s._spiderLeg._path.childNodes[1],u.setAttribute("from",.5),u.setAttribute("to",0),u.setAttribute("stroke-opacity",0),u.beginElement(),s._spiderLeg._path.setAttribute("stroke-opacity",0));setTimeout(function(){var n=0;for(o=r.length-1;o>=0;o--)s=r[o],s._spiderLeg&&n++;for(o=r.length-1;o>=0;o--){s=r[o];if(!s._spiderLeg)continue;s.setOpacity(1),s.setZIndexOffset(0),n>1&&L.FeatureGroup.prototype.removeLayer.call(e,s),t.removeLayer(s._spiderLeg),delete s._spiderLeg}e._animationEnd()},250)}}:{_animationSpiderfy:function(e,t){var n=this._group,r=n._map,i,s,o,u;for(i=e.length-1;i>=0;i--)u=r.layerPointToLatLng(t[i]),s=e[i],s._preSpiderfyLatlng=s._latlng,s.setLatLng(u),s.setZIndexOffset(1e6),L.FeatureGroup.prototype.addLayer.call(n,s),o=new L.Polyline([this._latlng,u],{weight:1.5,color:"#222"}),r.addLayer(o),s._spiderLeg=o;this.setOpacity(.3)},_animationUnspiderfy:function(){var e=this._group,t=e._map,n=this.getAllChildMarkers(),r,i;this.setOpacity(1);for(i=n.length-1;i>=0;i--)r=n[i],L.FeatureGroup.prototype.removeLayer.call(e,r),r.setLatLng(r._preSpiderfyLatlng),delete r._preSpiderfyLatlng,r.setZIndexOffset(0),t.removeLayer(r._spiderLeg),delete r._spiderLeg}}),L.MarkerClusterGroup.include({_spiderfied:null,_spiderfierOnAdd:function(){this._map.on("click zoomstart",this._unspiderfy,this),L.Browser.svg&&this._map._initPathRoot()},_spiderfierOnRemove:function(){this._map.off("click zoomstart",this._unspiderfy,this)},_unspiderfy:function(){this._spiderfied&&this._spiderfied.unspiderfy()},_unspiderfyLayer:function(e){e._spiderLeg&&(L.FeatureGroup.prototype.removeLayer.call(this,e),e.setOpacity(1),e.setZIndexOffset(0),this._map.removeLayer(e._spiderLeg),delete e._spiderLeg)}})})(this);