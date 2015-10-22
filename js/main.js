function init(){
	
	window.popup_open = false;
	
    var carto_db1 = L.tileLayer(
    	'http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
    		attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="http://cartodb.com/attributions">CartoDB</a>'
	});
    
	var base_osm2 =  L.tileLayer(
    		'http://{s}x={x}&y={y}&z={z}',{
    		subdomains: ['openmapsurfer.uni-hd.de/tiles/roads/', 
				'korona.geog.uni-heidelberg.de/tiles/roads/', 
				'129.206.74.245:8001/tms_r.ashx?'],
			minZoom: 2,
			maxZoom: 18});
			
    var base_osm3 =  L.tileLayer(
    		'http://{s}x={x}&y={y}&z={z}',{
    		subdomains: ['openmapsurfer.uni-hd.de/tiles/roads/', 
				'korona.geog.uni-heidelberg.de/tiles/roads/', 
				'129.206.74.245:8001/tms_r.ashx?'],
			minZoom: 2,
			maxZoom: 18});

	function getLayers(list,color_list){
		var temp_list = [];
		window.color = color_list;
		for(i in list){
			window.field = list[i];
			var temp = L.geoJson(response_countries,{
				style: getStyle,
				onEachFeature: getOnEachFeature
			});
			temp_list.push(temp);
		}
		return temp_list;
    };
	
	var all_layers1 = getLayers(col_header1,color1);
	var all_layers2 = getLayers(col_header2,color2);

    var map1 = L.map('map1', {
        center: [48.210033, 16.363449],
        zoom: 3,
        layers: [carto_db1,all_layers1[0]]
    });
	
	var map2 = L.map('map2', {
        center: [48.210033, 16.363449],
        zoom: 3,
        layers: [base_osm2,all_layers2[1]]
    });

		
	map1.sync(map2);
	map2.sync(map1);
	
	function getControl(list_names,list_layers){
		var temp =[];
		for(i in list_names){
		temp[list_names[i]] = list_layers[i];		
		};
		return temp;
	};
	
	var all_controls1 = getControl(col_header1,all_layers1);
	var all_controls2 = getControl(col_header2,all_layers2);

    L.control.layers(all_controls1).addTo(map1);
	L.control.layers(all_controls2).addTo(map2); 	
	    
    var legends1 = L.control({position: 'bottomleft'});
	var legends2 = L.control({position: 'bottomleft'});

	legends1.onAdd = function (map) {
        this._div = L.DomUtil.create('div', 'legends1');
        this.update1();
        return this._div;
    };
	legends2.onAdd = function (map) {
        this._div = L.DomUtil.create('div', 'legends2');
        this.update2();
        return this._div;
    };
	
	legends1.update1 = function (field){
		if(!(field)){field = init_field}
		var max = getMax(col_max,field);
		var labels = [(max[1][4]+1).toLocaleString() + " - " + (max[0]).toLocaleString(),
					(max[1][3]+1).toLocaleString() + " - " + (max[1][4]).toLocaleString(),
					(max[1][2]+1).toLocaleString() + " - " + (max[1][3]).toLocaleString(),
					(max[1][1]+1).toLocaleString() +" - " + (max[1][2]).toLocaleString(),
					"1 - " + (max[1][1]).toLocaleString()];
		var html = "<p><b>"+ field +"</b></p>";
		var color = color1
		for(i=0;i<5;i++){
			html = html +'<p><i style="background-color:' + color[4-i]+'"></i> '+labels[i]+'</p>';}
		this._div.innerHTML = html;
	};
	legends2.update2 = function (field){
		if(!(field)){field = init_field}
		var max = getMax(col_max,field);
		var labels = [(max[1][4]+1).toLocaleString() + " - " + (max[0]).toLocaleString(),
					(max[1][3]+1).toLocaleString() + " - " + (max[1][4]).toLocaleString(),
					(max[1][2]+1).toLocaleString() + " - " + (max[1][3]).toLocaleString(),
					(max[1][1]+1).toLocaleString() +" - " + (max[1][2]).toLocaleString(),
					"1 - " + (max[1][1]).toLocaleString()];
		var html = "<p><b>"+ field +"</b></p>";
		var color = color2
		for(i=0;i<5;i++){
			html = html +'<p><i style="background-color:' + color[4-i]+'"></i> '+labels[i]+'</p>';}
		this._div.innerHTML = html;
	};
	
    map1.on('baselayerchange', function (eventLayer) {
          legends1.update1(eventLayer.name);
    });
	map2.on('baselayerchange', function (eventLayer) {
          legends2.update2(eventLayer.name);
    });
        
	var init_field = "Total Migrants";
    legends1.addTo(map1);
	var init_field = "Total Beneficiary Contacts";
	legends2.addTo(map2);
    
    return [map1,map2];
}


function getOnEachFeature(feature, layer) {
	layer.bindPopup("<b>" + feature.properties.name
				+ "</b><br/>"+ field +": " + getData(totality_response,feature.properties.iso_a3,field).toLocaleString());
    layer.on({
        mouseover: onMouseOver,		
		mouseout: onMouseOut,
		popupopen: onPopupOpen,
		popupclose: onPopupClose,
		click: zoomToFeature
    });
}

function zoomToFeature(e) {
	var temp;
	if(e.target.feature.properties.iso_a3 == window.zoomed){
		temp = bounds;
		window.zoomed = NaN;
		}else{
		temp = e.target.getBounds();
		window.zoomed = e.target.feature.properties.iso_a3;}
	map1.unsync(map2);
	map2.unsync(map1);
    map1.fitBounds(temp);
	map2.fitBounds(temp);
	map1.sync(map2);
	map2.sync(map1);
}		

function onMouseOver(e) {
	if(!popup_open){
		document.getElementById("dmg_dis").innerHTML = "<b>" + e.target.feature.properties.name + "<b/>";
		for(k=1;k<8;k++){
			var temp_data1 = getData(totality_response,e.target.feature.properties.iso_a3,col_header1[(k-1)]);
			var temp_data2 = temp_data1 ? temp_data1 : 0;
			var temp_id1 = "dmg_dis_"+k.toString();
			var temp_id2 = "dmg_full_"+k.toString();
			var temp_value1 = Math.round(temp_data2/ parseInt(document.getElementById(temp_id2).innerHTML.replace(/[\.,]/g, ""))*100);
			var temp_value2 = !(temp_value1) ? "00" : ("00"+ temp_value1).slice(-2); 
			document.getElementById(temp_id1).innerHTML = "" + temp_data2.toLocaleString() + "<small> | </small>" + temp_value2 + "<small>%</small>"+
			"<div style='width:75%; line-height:25%' class='styled1' align='right'><progress style='height: 5px' value='"+parseInt(temp_value2)+"' max='"+100+"'></progress></div></div>";
		 }
		document.getElementById("dist_dis").innerHTML = "<b>" + e.target.feature.properties.name + "<b/>";
		for(k=1;k<8;k++){
			var temp_data1 = getData(totality_response,e.target.feature.properties.iso_a3,col_header2[(k-1)]);
			var temp_data2 = temp_data1 ? temp_data1 : 0;
			var temp_id1 = "dist_dis_"+k.toString();
			var temp_id2 = "dist_full_"+k.toString();
			var temp_value1 = Math.round(temp_data2/ parseInt(document.getElementById(temp_id2).innerHTML.replace(/[\.,]/g, ""))*100);
			var temp_value2 = !(temp_value1) ? "00" : ("00"+ temp_value1).slice(-2); 
			document.getElementById(temp_id1).innerHTML = "" + temp_data2.toLocaleString() + "<small> | </small>" + temp_value2 + "<small>%</small>"+
			"<div style='width:75%; line-height:25%' class='styled2' align='right'><progress style='height: 5px' value='"+parseInt(temp_value2)+"' max='"+100+"'></progress></div></div>";
		 }	
		document.getElementById("vol_dis").innerHTML = "<b>" + e.target.feature.properties.name + "<b/>";
		for(k=1;k<11;k++){
			var temp_data1 = getData(totality_response,e.target.feature.properties.iso_a3,col_header3[(k-1)]);
			var temp_data2 = temp_data1 ? temp_data1 : 0;
			var temp_id1 = "vol_dis_"+k.toString();
			var temp_id2 = "vol_full_"+k.toString();
			var temp_value1 = Math.round(temp_data2/ parseInt(document.getElementById(temp_id2).innerHTML.replace(/[\.,]/g, ""))*100);
			var temp_value2 = !(temp_value1) ? "00" : ("00"+ temp_value1).slice(-2); 
			document.getElementById(temp_id1).innerHTML = "" + temp_data2.toLocaleString() + "<small> | </small>" + temp_value2 + "<small>%</small>"+
			"<div style='width:75%; line-height:25%' class='styled3' align='right'><progress style='height: 5px' value='"+parseInt(temp_value2)+"' max='"+100+"'></progress></div></div>";
		 }
	}
}

function onPopupOpen(e) {
	var temp_field = e.popup._content.match(/(<br\/>).+(:)/g)[0];
	temp_field = temp_field.slice(5,temp_field.length - 1);
	console.log(temp_field);
	console.log(col_header1);
	console.log(col_header1.indexOf(temp_field) > -1);
	if(col_header1.indexOf(temp_field) > -1){
		map2.closePopup();
		map3.closePopup();
	}else if(col_header2.indexOf(temp_field) > -1){
		map1.closePopup();
		map3.closePopup();
	}else{
		map1.closePopup();
		map2.closePopup();
	}
	onMouseOver(e);
	window.popup_open = true;
}

function onMouseOut() {
	if(!popup_open){	
		document.getElementById("dmg_dis").innerHTML = "<b>name<b/>";
		for(k=1;k<8;k++){
			var temp_id1 = "dmg_dis_"+k.toString();
			var temp_value = 0;
			document.getElementById(temp_id1).innerHTML = "- <small>|</small> 00<small>%</small>" + 
			"<div style='width:75%; line-height:25%' class='styled1' align='right'><progress value='"+temp_value+"' max='"+100+"'></progress></div></div>";
		 }
		document.getElementById("dist_dis").innerHTML = "<b>name<b/>";
		for(k=1;k<8;k++){
			var temp_id1 = "dist_dis_"+k.toString();
			var temp_value = 0;
			document.getElementById(temp_id1).innerHTML = "- <small>|</small> 00<small>%</small>" + 
			"<div style='width:75%; line-height:25%' class='styled2' align='right'><progress value='"+temp_value+"' max='"+100+"'></progress></div></div>";
		}	
		document.getElementById("vol_dis").innerHTML = "<b>name<b/>";
		for(k=1;k<11;k++){
			var temp_id1 = "vol_dis_"+k.toString();
			var temp_value = 0;
			document.getElementById(temp_id1).innerHTML = "- <small>|</small> 00<small>%</small>" + 
			"<div style='width:75%; line-height:25%' class='styled3' align='right'><progress value='"+temp_value+"' max='"+100+"'></progress></div></div>";
		}
	}
}

function onPopupClose(e) {
	window.popup_open = false;
}
    
var maps = init();
var map1 = maps[0];
var map2 = maps[1];
var bounds = map1.getBounds();
console.log(bounds);
var zoomed = NaN;

/*
for(k=1;k<8;k++){
	document.getElementById("dmg_full_"+k).innerHTML = parseInt( col_max[k-1].sum ).toLocaleString() + 
							"<div style='line-height:40%' class='styled1' align='right'><progress value='"+100+"' max='"+100+"'></progress></div></div>";
	document.getElementById("dmg_dis_"+k).innerHTML = "- <small>|</small> 00<small>%</small>" + 
							"<div style='width:75%; line-height:25%' class='styled1' align='right'><progress value='"+0+"' max='"+100+"'></progress></div></div>";
}
for(k=1;k<8;k++){
document.getElementById("dist_full_"+k).innerHTML = parseInt( col_max[k+6].sum ).toLocaleString() + 
							"<div style='line-height:40%' class='styled2' align='right'><progress value='"+100+"' max='"+100+"'></progress></div></div>";
	document.getElementById("dist_dis_"+k).innerHTML = "- <small>|</small> 00<small>%</small>" + 
							"<div style='width:75%; line-height:25%' class='styled2' align='right'><progress value='"+0+"' max='"+100+"'></progress></div></div>";
}
for(k=1;k<11;k++){
document.getElementById("vol_full_"+k).innerHTML = parseInt( col_max[k+13].sum ).toLocaleString() + 
							"<div style='line-height:40%' class='styled3' align='right'><progress value='"+100+"' max='"+100+"'></progress></div></div>";
	document.getElementById("vol_dis_"+k).innerHTML = "- <small>|</small> 00<small>%</small>" + 
							"<div style='width:75%; line-height:25%' class='styled3' align='right'><progress value='"+0+"' max='"+100+"'></progress></div></div>";
}
*/