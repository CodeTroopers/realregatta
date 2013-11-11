/*jslint browser: true */
/*global $, THREE, Stats */

var RealRegatta = (function () {
    "use strict";

    var renderer = null,
        scene = null,
        camera = null,
        root = null,
        earth = null,
        earthRadius = 3,
        earthBands = 40,
        stats = null,
        duration = 10000, // ms
        currentTime = Date.now();

    function animate() {
        var now = Date.now(),
            deltat = now - currentTime,
            fract = deltat / duration,
            angle = Math.PI * 2 * fract;

        currentTime = now;

        // Rotate the earth group about its Y axis
        //earth.rotation.y += angle;
    }

    function run() {
        stats.begin();
        requestAnimationFrame(function () {
            RealRegatta.run();
        });

        // Render the scene
        renderer.render(scene, camera);

        // Spin the cube for next frame
        animate();
        stats.end();
    }

    var materials = {},
        mapUrl = "./images/earth_atmos_2048.jpg",
        map = null,
        normalMapUrl = "./images/earth_normal_2048.jpg",
        normalMap = null;

    function createMaterials() {
        // Create a textre phong material for the cube
        // First, create the texture map
        map = THREE.ImageUtils.loadTexture(mapUrl);
        normalMap = THREE.ImageUtils.loadTexture(normalMapUrl);

        //materials["phong"] = new THREE.MeshPhongMaterial({ map: map });
        materials["phong-normal"] = new THREE.MeshPhongMaterial({
            map: map,
            normalMap: normalMap
        });
    }

    function createScene(canvas) {
        // Create the Three.js renderer and attach it to our canvas
        renderer = new THREE.WebGLRenderer({
            canvas: canvas,
            antialias: true
        });

        // Set the viewport size
        renderer.setSize(canvas.width, canvas.height);

        // Create a new Three.js scene
        scene = new THREE.Scene();

        // Add  a camera so we can view the scene
        camera = new THREE.PerspectiveCamera(45, canvas.width / canvas.height, 1, 1000);
        camera.position.z = 10;
        scene.add(camera);

        // Create a group to hold all the objects
        root = new THREE.Object3D();

        // Add a directional light to show off the object
        var light = new THREE.DirectionalLight(0xffffff, 2);

        // Position the light out from the scene, pointing at the origin
        light.position.set(0.5, 0, 1);
        root.add(light);

        light = new THREE.AmbientLight(0); // 0x222222 );
        root.add(light);

        // Create a group to hold the spheres
        //group = new THREE.Object3D;
        //root.add(group);

        // Create all the materials
        createMaterials();
        earth = new THREE.Object3D();
        // And put the geometry and material together into a mesh
        earth.add(new THREE.Mesh(new THREE.SphereGeometry(earthRadius, earthBands, earthBands), materials["phong-normal"]));
        root.add(earth);
        //group.add( sphereNormalMapped );

        // Now add the group to our scene
        scene.add(root);

        getBoat('234059');
    }

    function rotateScene(deltaX, deltaY) {
        earth.rotation.y += deltaX / 100;
        earth.rotation.x += deltaY / 100;
    }

    function scaleScene(scale) {
        root.scale.set(scale, scale, scale);
    }

    var mouseDown = false,
        mouseX = 0,
        mouseY = 0;

    function onMouseMove(evt) {
        if (!mouseDown) {
            return;
        }

        evt.preventDefault();

        var deltaX = evt.clientX - mouseX,
            deltaY = evt.clientY - mouseY;
        mouseX = evt.clientX;
        mouseY = evt.clientY;
        rotateScene(deltaX, deltaY);
    }

    function onMouseDown(evt) {
        evt.preventDefault();

        mouseDown = true;
        mouseX = evt.clientX;
        mouseY = evt.clientY;
    }

    function onMouseUp(evt) {
        evt.preventDefault();

        mouseDown = false;
    }

    var zoomMin = 1 / 10,
        zoomMax = 1 / earthRadius,
        zoom;

    function onMouseWheel(evt) {
        evt.preventDefault();
        var delta = evt.deltaY ? evt.deltaY * (-120) : evt.wheelDeltaY;
        zoom = 1 / (camera.position.z - delta * 0.001);
        camera.position.z = 1 / Math.max(Math.min(zoom, zoomMax), zoomMin);
    }

    function addMouseHandler(canvas) {
        canvas.addEventListener('mousemove', onMouseMove, false);
        canvas.addEventListener('mousedown', onMouseDown, false);
        canvas.addEventListener('mouseup', onMouseUp, false);
        canvas.addEventListener('onwheel' in document ? 'wheel' : 'mousewheel', onMouseWheel, false);
    }

    function initStats() {
        stats = new Stats();
        $('#stats-widget').append(stats.domElement);
    }

    $(document).ready(function () {
        initStats();
        var canvas = document.getElementById("webglcanvas");

        // create the scene
        createScene(canvas);

        // add mouse handling so we can rotate the scene
        addMouseHandler(canvas);

        // Run the run loop
        run();
    });

    function getOpponents() {
        var boats = [];
        $.ajax({
            url: 'http://gosouth.virtualregatta.com/get_opponents_1_1.xml',
            type: 'GET',
            data: {
                /*step: 1,
                r: 'ranking',
                id_user: '234059',//2196919
                lang: 'FR',
                menu: 0*/
            },
            query: 'select * from xml where url="{URL}"',
            success: function (data) {
                var response = $.parseXML(data.responseText);
                $(response).find("boat").each(function () {
                    var boatXml = $(this),
                        boat = new Boat({
                            id_user: boatXml.attr("id_user"),
                            pseudo: boatXml.find("pseudo").text(),
                            type: boatXml.find("type").text(),
                            metric: boatXml.find("metric").text(),
                            country: boatXml.find("country").text(),
                            full_option: boatXml.find("full_option").text(),
                            color: boatXml.find("couleur1").text(),
                            boatImage: boatXml.find("boatPng").text(),
                            voile: boatXml.find("voile").text(),
                            longitude: boatXml.find("longitude").text(),
                            latitude: boatXml.find("latitude").text(),
                            speed: boatXml.find("vitesse").text(),
                            wind_speed: boatXml.find("wind_speed").text(),
                            wind_angle: boatXml.find("wind_angle").text(),
                            cap: boatXml.find("cap").text(),
                            distancerestante: boatXml.find("distancerestante").text(),
                            distanceparcourue: boatXml.find("distanceparcourue").text(),
                            rank: boatXml.find("classement").text(),
                            is_arrived: boatXml.find("IsArrived").text(),
                            time: boatXml.find("temps_etape").text(),
                            trajectoire: boatXml.find("trajectoire").text()
                        });

                    var trajectoire = boat.trajectoire.split(";"),
                        geometry = null;
                    for (var i = 0; i < trajectoire.length; i += 2) {
                        if (trajectoire[i] !== undefined && trajectoire[i + 1] !== undefined) {
                            var p1 = trajectoire[i].split("!");
                            var p2 = trajectoire[i + 1].split("!");
                            if (p1.length > 1 && p2.length > 1) {
                                var v1 = LLToXYZ(THREE.Math.degToRad(p1[0]), THREE.Math.degToRad(p1[1]));
                                var v2 = LLToXYZ(THREE.Math.degToRad(p2[0]), THREE.Math.degToRad(p2[1]));
                                //var geometry = new THREE.CircleGeometry(earthRadius, earthBands, 0, THREE.Math.degToRad(p2[0]-p1[0]));
                                //geometry.vertices.splice(0,1);
                                //var geometry = CrossGeometry();
                                //var m = new THREE.Matrix4().makeRotationX(THREE.Math.degToRad(p1[0])).multiply(new THREE.Matrix4().makeRotationY(THREE.Math.degToRad((p1[2]=="w")?p1[1]:-p1[1])));
                                //geometry.applyMatrix(m);
                                //geometry.applyMatrix(new THREE.Matrix4().makeRotationY(THREE.Math.degToRad(p1[1])));

                                if (geometry === null) {
                                    geometry = new ArcGeometry(v1, v2);
                                } else {
                                    THREE.GeometryUtils.merge(geometry, new ArcGeometry(v1, v2));
                                }
                            }
                        }
                    }
                    var line = new THREE.Line(geometry, new THREE.LineBasicMaterial({
                        color: 0xff0000,
                        linewidth: 3
                    }));
                    earth.add(line);
                    boats.push(boat);




                    //var m = ((new THREE.Matrix4()).makeRotationX(THREE.Math.degToRad(25))).multiply((new THREE.Matrix4()).makeRotationY(THREE.Math.degToRad(15))).multiply((new THREE.Matrix4()).makeRotationZ(THREE.Math.degToRad(32)));

                    //var line = new THREE.Line(CrossGeometry(), new THREE.LineBasicMaterial( { color: 0xff0000, linewidth: 3} ));//, opacity: 1, linewidth: 3, vertexColors: THREE.VertexColors } ));
                    //earth.add(line);

                });
                document.getElementById('rank').innerHTML = boats;
            }

        });
    }

    function LLToXYZ(lat, lon) {
        /*var cosLat = Math.cos(lat);
        var sinLat = Math.sin(lat);
        var cosLon = Math.cos(lon);
        var sinLon = Math.sin(lon);
        return new THREE.Vector3(earthRadius * cosLat * cosLon, earthRadius * (-sinLat), earthRadius * cosLat * sinLon);*/

        var phi = THREE.Math.degToRad(lat),
            theta = THREE.Math.degToRad(lon),
            cosPhi = Math.cos(phi),
            sinPhi = Math.sin(phi),
            cosTheta = Math.cos(theta),
            sinTheta = Math.sin(theta);
        return new THREE.Vector3(earthRadius * cosPhi * cosTheta, earthRadius * sinPhi, -earthRadius * cosPhi * sinTheta);
    }

    function getRotation(boat) {

        /*var phi = THREE.Math.degToRad(lat),
            theta = THREE.Math.degToRad(lon),
            cosPhi = Math.cos(phi),
            sinPhi = Math.sin(phi),
            cosTheta = Math.cos(theta),
            sinTheta = Math.sin(theta);
        //var rotation = new THREE.Matrix4().makeRotationX(earthRadius * cosPhi * cosTheta).makeRotationY(earthRadius * sinPhi).makeRotationZ(-earthRadius * cosPhi * sinTheta);
        var rotation = new THREE.Matrix4().makeRotationZ(-earthRadius * cosPhi * sinTheta);*/
        var v = LLToXYZ(boat.latitude, boat.longitude);
        var rotationX = new THREE.Matrix4().makeRotationX(- THREE.Math.degToRad(boat.latitude));//new THREE.Matrix4().makeRotationX(-Math.atan(v.y/v.z));
        var rotationY = new THREE.Matrix4().makeRotationY(Math.PI / 2 + THREE.Math.degToRad(boat.longitude));//Math.atan(v.x/v.z));//.makeRotationZ(math.PI / 2);
		return rotationY.multiply(rotationX);
		//var rotationX = new THREE.Matrix4().makeRotationX(Math.asin(v.y/earthRadius));
		/*var rotationX = new THREE.Matrix4().makeRotationX(-Math.atan(v.z/v.y));
        var rotationY = new THREE.Matrix4().makeRotationY(Math.atan(v.x/v.z));
		var rotationZ = new THREE.Matrix4().makeRotationZ(Math.atan(v.y/v.x));
        return rotationX.multiply(rotationY).multiply(rotationZ);*/
    }

    function ArcGeometry2(lat1, lon1, lat2, lon2) {
        var p1 = LLToXYZ(lat1, lon1);
        var p2 = LLToXYZ(lat2, lon2);
        var angle = Math.acos(p1.dot(p2) / (p1.length() * p2.length()));
        var geometry = new THREE.CircleGeometry(earthRadius, earthBands, 0, angle);
        geometry.vertices.splice(0, 1);
        var rotation = new THREE.Matrix4().makeRotationX(-Math.atan((p2.z - p1.z) / (p2.y - p1.y)));
        geometry.applyMatrix(rotation);
        geometry.applyMatrix(new THREE.Matrix4().makeRotationY(-lon1));
        geometry.applyMatrix(new THREE.Matrix4().makeRotationZ(-lat1));
        /*var angleR = angle/2;
        var translation = new THREE.Matrix4().makeTranslation(-earthRadius*Math.cos(angleR),-earthRadius*Math.sin(angleR),0);
        geometry.applyMatrix(translation);
        var rotation = new THREE.Matrix4().makeRotationX(Math.PI/2);
        geometry.applyMatrix(rotation);
        geometry.applyMatrix(translation.getInverse(translation));*/
        return geometry;
    }

    function ArcGeometry(p1, p2) {
        var angle = Math.acos(p1.dot(p2) / (p1.length() * p2.length()));
        var geometry = new THREE.Geometry();
        //var geometry = new THREE.CircleGeometry(earthRadius, earthBands, 0, angle);//Math.atan(p1.y/p1.x)
        //geometry.vertices.splice(0,1);
        //var translation = new THREE.Matrix4().makeTranslation(-earthRadius*Math.cos(angle/2),-earthRadius*Math.sin(angle/2),0);
        //geometry.applyMatrix(translation);
        //geometry.applyMatrix(new THREE.Matrix4().makeRotationX(Math.atan((p2.z-p1.z) / (p2.y-p1.y))));
        //geometry.applyMatrix(new THREE.Matrix4().makeRotationZ(Math.atan(p1.y / p1.x)));
        //geometry.applyMatrix(new THREE.Matrix4().makeRotationY(Math.atan((p2.z-p1.z) / (p2.x-p1.x))));
        // create arc
        //var geometry = new THREE.CircleGeometry(earthRadius, earthBands, 0, angle);
        // remove center vertex
        //geometry.vertices.splice(0,1);
        // rotate around x axis
        //geometry.applyMatrix(new THREE.Matrix4().makeRotationX(Math.atan((p2.z-p1.z) / (p2.y-p1.y))));
        // rotate around z axis
        //geometry.applyMatrix(new THREE.Matrix4().makeRotationZ(-Math.atan(p1.y / p1.x)));
        // rotate around y axis
        //geometry.applyMatrix(new THREE.Matrix4().makeRotationY(Math.atan(p1.z / p1.y)));
        geometry.vertices.push(p1);
        geometry.vertices.push(p2);
        //geometry.applyMatrix(translation.getInverse(translation));
        /*var angleR = angle/2;
        var translation = new THREE.Matrix4().makeTranslation(-earthRadius*Math.cos(angleR),-earthRadius*Math.sin(angleR),0);
        geometry.applyMatrix(translation);
        var rotation = new THREE.Matrix4().makeRotationX(Math.PI/2);
        geometry.applyMatrix(rotation);
        geometry.applyMatrix(translation.getInverse(translation));*/
        return geometry;
    }

    function CrossGeometry() {
        var geometry = new THREE.CircleGeometry(earthRadius, earthRadius * 10, THREE.Math.degToRad(0), THREE.Math.degToRad(10));
        geometry.vertices.splice(0, 1);
        var angle = THREE.Math.degToRad(5);
        var translation = new THREE.Matrix4().makeTranslation(-earthRadius * Math.cos(angle), -earthRadius * Math.sin(angle), 0);
        var geometry2 = geometry.clone();
        geometry2.applyMatrix(translation);
        var rotation = new THREE.Matrix4().makeRotationX(Math.PI / 2);
        geometry2.applyMatrix(rotation);
        geometry2.applyMatrix(translation.getInverse(translation));
        THREE.GeometryUtils.merge(geometry, geometry2);
        return geometry;
    }

    function Course(course) {
        this.name = course.name;
        this.domain = course.domain;
        this.checksum = course.checksum;
    }

    function Boat(boat) {
        this.id_user = boat.id_user;
        this.pseudo = boat.pseudo;
        this.type = boat.type;
        this.metric = boat.metric;
        this.country = boat.country;
        this.full_option = boat.full_option;
        this.color = boat.color;
        this.boatImage = boat.boatImage;
        this.voile = boat.voile;
        this.longitude = boat.longitude;
        this.latitude = boat.latitude;
        this.speed = boat.speed;
        this.wind_speed = boat.wind_speed;
        this.wind_angle = boat.wind_angle;
        this.cap = boat.cap;
        this.distancerestante = boat.distancerestante;
        this.distanceparcourue = boat.distanceparcourue;
        this.rank = boat.rank;
        this.is_arrived = boat.is_arrived;
        this.time = boat.time;
        this.trajectoire = boat.trajectoire;
    }

    Boat.prototype.toString = function () {
        return this.pseudo;
    };

    function getBoat(id_user) {
        var course = new Course({
            name: "Jacques Vabre Mono",
            domain: "jacquesvabre-mono.virtualregatta.com",
            checksum: "c210a8c11912a446852f6dd1e6ad0458dcefde56"
        });
        $.ajax({
            url: 'http://' + course.domain + '/core/Service/ServiceCaller.php',
            type: 'GET',
            data: {
                service: 'GetUser',
                id_user: id_user,
                id_boat: id_user,
                lang: 'FR',
                light: 1,
                //auto: 1,
                checksum: course.checksum
            },
            query: 'select * from xml where url="{URL}"',
            success: function (data) {
                var response = $.parseXML(data.responseText);
                //$(response).find("user").each(function() {
                var boatXml = $(response).find("result > user");
                var boat = new Boat({
                    /*id_user: boatXml.attr("id_user"),*/
                    pseudo: boatXml.find("result > user > pseudo").text(),
                    //type: boatXml.find("type").text(),
                    /*metric: boatXml.find("metric").text(),
                    country: boatXml.find("country").text(),
                    full_option: boatXml.find("full_option").text(),
                    color: boatXml.find("couleur1").text(),
                    boatImage: boatXml.find("boatPng").text(),
                    voile: boatXml.find("voile").text(),*/
                    longitude: parseFloat(boatXml.find("result > user > position > longitude").text().replace(",", ".")),
                    latitude: parseFloat(boatXml.find("result > user > position > latitude").text().replace(",", ".")),
                    speed: parseFloat(boatXml.find("result > user > position > vitesse").text().replace(",", ".")),
                    wind_speed: parseFloat(boatXml.find("result > user > position > wind_speed").text().replace(",", ".")),
                    wind_angle: parseFloat(boatXml.find("result > user > position > wind_angle").text().replace(",", ".")),
                    cap: parseFloat(boatXml.find("result > user > position > cap").text().replace(",", ".")),
                    distancerestante: parseFloat(boatXml.find("result > user > position > distancerestante").text().replace(",", ".")),
                    distanceparcourue: parseFloat(boatXml.find("result > user > position > distanceparcourue").text().replace(",", ".")),
                    rank: parseFloat(boatXml.find("result > user > position > classement").text().replace(",", ".")),
                    /*is_arrived: boatXml.find("IsArrived").text(),*/
                    time: boatXml.find("result > user > position > temps_etape").text(),
                    trajectoire: boatXml.find("result > user > trajectoire").text()
                });
                var trajectoire = boat.trajectoire.split(";");
                var position = LLToXYZ(boat.latitude, boat.longitude);
                var geometry = null,
                    v1, v2;
                for (var i = 0; i < trajectoire.length; i += 2) { //
                    if (trajectoire[i] !== undefined && trajectoire[i + 1] !== undefined) {
                        var p1 = trajectoire[i].split("!");
                        var p2 = trajectoire[i + 1].split("!");
                        if (p1.length > 1 && p2.length > 1) {
                            v1 = LLToXYZ(p1[1], p1[0]);
                            v2 = LLToXYZ(p2[1], p2[0]);
                            //var geometry = new THREE.CircleGeometry(earthRadius, earthBands, 0, THREE.Math.degToRad(p2[0]-p1[0]));
                            //geometry.vertices.splice(0,1);
                            //var geometry = CrossGeometry();
                            //var m = new THREE.Matrix4().makeRotationX(THREE.Math.degToRad(p1[0])).multiply(new THREE.Matrix4().makeRotationY(THREE.Math.degToRad((p1[2]=="w")?p1[1]:-p1[1])));
                            //geometry.applyMatrix(m);
                            //geometry.applyMatrix(new THREE.Matrix4().makeRotationY(THREE.Math.degToRad(p1[1])));
                            //v1 = LLToXYZ(THREE.Math.degToRad(25),THREE.Math.degToRad(0));
                            //v2=  LLToXYZ(THREE.Math.degToRad(0),THREE.Math.degToRad(35));
                            if (geometry === null) {
                                //geometry = ArcGeometry2(THREE.Math.degToRad(25),THREE.Math.degToRad(0), THREE.Math.degToRad(0),THREE.Math.degToRad(35));
                                geometry = new ArcGeometry(v1, v2);
                            } else {
                                THREE.GeometryUtils.merge(geometry, new ArcGeometry(v1, v2));
                            }
                        }
                    }
                }
                if (geometry !== null) {
                    THREE.GeometryUtils.merge(geometry, new ArcGeometry(v2, position));
                    var line = new THREE.Line(geometry, new THREE.LineBasicMaterial({
                        color: 0xff0066,
                        linewidth: 3
                    }));
                    earth.add(line);
                }
                var tagGeometry = new TagGeometry(boat.pseudo, position.x, position.y, position.z);
                DrawBoat(boat, position.x, position.y, position.z);
                /*var material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
                var mesh = new THREE.Mesh(tagGeometry, material);
                earth.add(mesh);*/
                //});
                $('#rank').html(boat.rank + 'e');
                $('#latitude').html(boat.latitude.toFixed(2));
                $('#longitude').html(boat.longitude.toFixed(2));
                $('#cap').html(boat.cap);
                $('#distanceparcourue').html(boat.distanceparcourue.toFixed(2));
                $('#distancerestante').html(boat.distancerestante.toFixed(2));
            }
        });
    }

    function TagGeometry(text, x, y, z) {
        var translation = new THREE.Matrix4().makeTranslation(x + 0.1, y, z);
        var textGeometry = new THREE.TextGeometry(text, {
            size: earthRadius / 30,
            height: 0.0002,
            font: "helvetiker"
        });
        textGeometry.applyMatrix(new THREE.Matrix4().makeTranslation(0, 0, -0.0001));
        textGeometry.applyMatrix(translation);
        var material = new THREE.MeshLambertMaterial({
            color: 0xff0066
        });
        var mesh = new THREE.Mesh(textGeometry, material);
        earth.add(mesh);

        var shape = new THREE.Shape();

        (function roundedRect(ctx, x, y, width, height, radius) {

            ctx.moveTo(x, y + radius);
            ctx.lineTo(x, y + height - radius);
            ctx.quadraticCurveTo(x, y + height, x + radius, y + height);
            ctx.lineTo(x + width - radius, y + height);
            ctx.quadraticCurveTo(x + width, y + height, x + width, y + height - radius);
            ctx.lineTo(x + width, y + radius);
            ctx.quadraticCurveTo(x + width, y, x + width - radius, y);
            ctx.lineTo(x + radius, y);
            ctx.quadraticCurveTo(x, y, x, y + radius);

        })(shape, -0.05, -0.05, text.length * earthRadius / 30, 0.2, 0.05);
        var geometry = new THREE.ShapeGeometry(shape);

        geometry.applyMatrix(translation);

        earth.add(new THREE.Mesh(geometry, new THREE.MeshLambertMaterial({
            color: 0xffffff,
            side: THREE.DoubleSide
        })));


        return geometry;
    }

    function DrawBoat(boat, x, y, z) {
        var translation = new THREE.Matrix4().makeTranslation(x, y, z);
        var shape = new THREE.Shape();
        /*var width = 0.02,
            length = 0.07;*/
		var width = 0.03,
            length = 0.08;
        shape.moveTo(0, length / 2);
        shape.quadraticCurveTo(width, 0, width / 2, -length / 2);
        shape.quadraticCurveTo(0, -length / 2 - length / 10, -width / 2, -length / 2);
        shape.quadraticCurveTo(-width, 0, 0, length / 2);
        var geometry = new THREE.ShapeGeometry(shape);
        var rotation = new THREE.Matrix4().makeRotationZ(-THREE.Math.degToRad(boat.cap));
        //rotation = rotation.multiply(getRotation(boat));
        geometry.applyMatrix(rotation);
        geometry.applyMatrix(getRotation(boat));
        geometry.applyMatrix(translation);
        earth.add(new THREE.Mesh(geometry, new THREE.MeshLambertMaterial({
            color: 0xff0066
        })));
        var points = shape.createPointsGeometry();
        /*line.position.set( x, y, z);
        line.rotation.set(- THREE.Math.degToRad(boat.latitude), Math.PI / 2 + THREE.Math.degToRad(boat.longitude), -THREE.Math.degToRad(boat.cap));*/
		points.applyMatrix(rotation);
        points.applyMatrix(getRotation(boat));
        points.applyMatrix(translation);
		var line = new THREE.Line( points, new THREE.LineBasicMaterial({
            color: 0xffffff
        }));
        
        earth.add(line);
    }

    return {
        "getBoat": function (id) {
            getBoat(id);
        },
        "run": function () {
            run();
        }
    };
})();
