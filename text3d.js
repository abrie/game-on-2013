"use strict";

define([], function() {
    var text = "character",
    height = 20,
    size = 70,
    hover = 30,

    curveSegments = 4,

    bevelThickness = 2,
    bevelSize = 1.5,
    bevelSegments = 3,
    bevelEnabled = true,

    font = "optimer", // helvetiker, optimer, gentilis, droid sans, droid serif
    weight = "bold", // normal bold
    style = "normal"; // normal italic
    function createText() {

        textGeo = new THREE.TextGeometry( text, {

            size: size,
            height: height,
            curveSegments: curveSegments,

            font: font,
            weight: weight,
            style: style,

            bevelThickness: bevelThickness,
            bevelSize: bevelSize,
            bevelEnabled: bevelEnabled,

            material: 0,
            extrudeMaterial: 1

        });

        textGeo.computeBoundingBox();
        textGeo.computeVertexNormals();

        // "fix" side normals by removing z-component of normals for side faces
        // (this doesn't work well for beveled geometry as then we lose nice curvature around z-axis)

        if ( ! bevelEnabled ) {

            var triangleAreaHeuristics = 0.1 * ( height * size );

            for ( var i = 0; i < textGeo.faces.length; i ++ ) {

                var face = textGeo.faces[ i ];

                if ( face.materialIndex == 1 ) {

                    for ( var j = 0; j < face.vertexNormals.length; j ++ ) {

                        face.vertexNormals[ j ].z = 0;
                        face.vertexNormals[ j ].normalize();

                    }

                    var va = textGeo.vertices[ face.a ];
                    var vb = textGeo.vertices[ face.b ];
                    var vc = textGeo.vertices[ face.c ];

                    var s = THREE.GeometryUtils.triangleArea( va, vb, vc );

                    if ( s > triangleAreaHeuristics ) {

                        for ( var j = 0; j < face.vertexNormals.length; j ++ ) {

                            face.vertexNormals[ j ].copy( face.normal );

                        }

                    }

                }

            }

        }

        var centerOffset = -0.5 * ( textGeo.boundingBox.max.x - textGeo.boundingBox.min.x );

        textMesh1 = new THREE.Mesh( textGeo, material );

        textMesh1.position.x = centerOffset;
        textMesh1.position.y = hover;
        textMesh1.position.z = 0;

        textMesh1.rotation.x = 0;
        textMesh1.rotation.y = Math.PI * 2;

        return textMesh1;
    }

    return {
        createText:createText,
    }
});
