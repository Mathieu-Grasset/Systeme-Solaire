"use strict"

//--------------------------------------------------------------------------------------------------------
// GLSL
//--------------------------------------------------------------------------------------------------------

// All the vertex and fragment shaders ...

//--------------------------------------------------------------------------------------------------------
//                          shader de la skybox repris du tp5
//--------------------------------------------------------------------------------------------------------
var sky_vert =
`#version 300 es

layout(location=0) in vec3 position_in;
out vec3 tex_coord;
uniform mat4 projectionviewMatrix;

void main()
{
	tex_coord = position_in;
	gl_Position = projectionviewMatrix * vec4(position_in, 1.0);
}  
`;

//--------------------------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------------------
var sky_frag =
`#version 300 es

precision highp float;
in vec3 tex_coord;
out vec4 frag;
uniform samplerCube TU;

void main()
{	
	frag = texture(TU, tex_coord);
}
`;


//  -------------------------------------------------------------
//  Soleil shaders, comme conseilé dans le sujet je vais placer les
//                  planètes en fonction du soleil.
// --------------------------------------------------------------
var soleil_vert = 
`#version 300 es

// Input
layout(location = 1) in vec3 position_in;
layout(location = 2) in vec2 textureCoord_in;

// Uniforms
uniform mat4 uProjectionMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uSensMatrix;

// Output 
out vec2 v_textureCoord;

// Main program
void main(){
    v_textureCoord = textureCoord_in;

    gl_Position = uProjectionMatrix * uViewMatrix * uSensMatrix * vec4(position_in,1.0);
}
`;

var soleil_frag = 
`#version 300 es
precision highp float;

// Input 
in vec2 v_textureCoord;

// Output
out vec4 oFragmentColor;

// Uniform
uniform sampler2D uSampler;

// Main program
void main()
{
    vec4 textureColor = texture(uSampler, v_textureCoord);
    
    oFragmentColor = textureColor;
}
`;

// ----------------------------------------------------------------
//                         Planète shaders
// ----------------------------------------------------------------

var planete_vert = 
`#version 300 es

// Input
layout(location = 3) in vec3 position_in;
layout(location = 4) in vec2 textureCoord_in;
layout(location = 5) in vec3 normal_in;

// Uniforms
uniform mat4 uProjectionMatrix;
uniform mat4 uViewMatrix;

uniform mat4 uInclinaisonMatrix;
uniform mat4 uSensMatrix;
uniform mat4 uRotationMatrix;
uniform mat4 uTranslateMatrix;
uniform mat4 uRevolutionMatrix;

uniform mat3 uNormalMatrix_World;
uniform float taille;

// Output 
out vec2 v_textureCoord;
out vec3 v_pos;
out vec3 v_normal;

// Main program
void main(){
    v_textureCoord = textureCoord_in;

    // Matrice objet sur laquelle on fait les modifications dans le repère
    mat4 uObjMatrix = uSensMatrix * uRevolutionMatrix * uTranslateMatrix *  uInclinaisonMatrix * uRotationMatrix ;

    // On modifie notre taille et de la planète 
    vec3 modifTaille = taille*position_in;
    

    // position en coordonnée du monde, pas coord vue
    v_pos = (uObjMatrix * vec4(modifTaille,1.0)).xyz;
    // normal en coord du monde, pas coord vue
    v_normal = normalize(uNormalMatrix_World*normal_in);

    // position projetée
    gl_Position = uProjectionMatrix * uViewMatrix * uObjMatrix * vec4(modifTaille,1.0);
    
}
`;


var planete_frag = 
`#version 300 es
precision highp float;

#define M_PI 3.14159265358979

// Input 
in vec2 v_textureCoord;
in vec3 v_pos;
in vec3 v_normal;


// Output
out vec4 oFragmentColor;

// Uniform
uniform sampler2D uSampler;
uniform sampler2D uSamplerNight; // Utile que pour la terre mais on va tricher un peu pour continuer à utiliser un unique shader pour les planètes
uniform float uAmbiant;


// Main program
void main()

{
    vec3 p = v_pos;
    vec4 textureColor = texture(uSampler, v_textureCoord);
    vec4 textureColorNight = texture(uSamplerNight, v_textureCoord);

    //                                              Lumières
    // Je n'ai pas su ajouté la lumière sur les astéroides sans créé une importante chute de fps, j'ai donc abadonné cette idée.
    vec3 n = normalize( v_normal );

    vec3 lightPos = vec3(0,0,0);
    vec3 lightDir = lightPos - p;
    lightDir = normalize(lightDir);

    vec3 ambiant = vec3(uAmbiant,uAmbiant,uAmbiant);
    float diffuseTerm = max(0.0,dot(n,lightDir));

 
    vec3 diffuse = textureColor.xyz * vec3(diffuseTerm);
 
    float Ns = 0.5;
    vec3 speculaire = vec3(1.0,1.0,1.0);
    vec3 Is = vec3(0.0);
    if(diffuseTerm > 0.0){
        vec3 viewDir = normalize (-p.xyz);
        vec3 halfDir = normalize(viewDir + lightDir);
        float specularTerm = max( 0.0 , pow(dot(n,halfDir),Ns));
        Is = speculaire * vec3(specularTerm);
        Is /= (Ns + 2.0)/(2.0*M_PI);
    }
    
    vec3 color = (0.3*ambiant)+(0.3*diffuse)+(0.3*Is);

    vec3 mixTex = mix(textureColorNight.rgb,textureColor.rgb,color);                // Double texture sur la terre en fonction de ce qu'elle recoit.
    oFragmentColor = vec4( mixTex.rgb * color,textureColor.a);
}
`;

// --------------------------------------------------------------------------------
//                            Astéroides shader
//    Inspiré de ce site : https://learnopengl.com/Advanced-OpenGL/Instancing
// --------------------------------------------------------------------------------


var ast_vert = 
`#version 300 es

// Input
layout(location = 0) in vec3 position_in;
layout(location = 2) in vec2 textureCoord_in;
layout(location = 3) in mat4 instanceRender;

// Uniforms
uniform mat4 uProjectionMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uRevolutionMatrix;
uniform mat4 uSensMatrix;

// Output 
out vec2 v_textureCoord;

// Main program
void main(){
    v_textureCoord = textureCoord_in;
    mat4 uObjMatrix =  uSensMatrix * uRevolutionMatrix;
    gl_Position = uProjectionMatrix * uViewMatrix * uObjMatrix * instanceRender * vec4(position_in,1.0);;
}
`;

var ast_frag = 
`#version 300 es
precision highp float;

// Input 
in vec2 v_textureCoord;

// Output
out vec4 oFragmentColor;

// Uniform
uniform sampler2D uSampler;

// Main program
void main()
{
    vec4 textureColor = texture(uSampler, v_textureCoord);
    
    oFragmentColor = textureColor;
}
`;

// ----------------------------------------------------------------------------------------------------------------
//                                          Lune de Jupiter shader
// Globalement la même implémentation que les planètes, c'est au niveau des translations que la différence se fait
// -----------------------------------------------------------------------------------------------------------------


var lune_vert = 
`#version 300 es

// Input
layout(location = 1) in vec3 position_in;
layout(location = 2) in vec3 normal_in;
layout(location = 3) in vec2 textureCoord_in;


// Uniforms
uniform mat4 uProjectionMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uModMatrix;

uniform mat3 uNormalMatrix;

uniform float taille;

// Output 
out vec2 v_textureCoord;
out vec3 v_pos;
out vec3 v_normal;

// Main program
void main(){
    v_textureCoord = textureCoord_in;

    vec3 modifTaille = taille*position_in;

    v_pos = (uModMatrix * vec4(modifTaille,1.0)).xyz;
    v_normal = normalize(uNormalMatrix*normal_in);

    gl_Position = uProjectionMatrix * uViewMatrix * uModMatrix * vec4(modifTaille,1.0);
    
}
`;


var lune_frag = 
`#version 300 es
precision highp float;

#define M_PI 3.14159265358979

// Input 
in vec2 v_textureCoord;
in vec3 v_pos;
in vec3 v_normal;

// Output
out vec4 oFragmentColor;

// Uniform
uniform sampler2D uSampler;
uniform float uAmbiant;

// Main program
void main()

{
    vec3 p = v_pos;
    vec4 textureColor = texture(uSampler, v_textureCoord);

    vec3 n = normalize( v_normal );

    vec3 lightPos = vec3(0.0,0.0,0.0);
    vec3 lightDir = lightPos - p;
    float d2 = dot(lightDir,lightDir);
    vec3 ambiant = vec3(uAmbiant,uAmbiant,uAmbiant);
    vec3 speculaire = vec3(1.0,1.0,1.0);
    float diffuseTerm = max(0.0,dot(n,lightDir));
    vec3 diffuse = textureColor.xyz * vec3(diffuseTerm);
    diffuse = diffuse;

    float Ns = 0.5;

    vec3 Is = vec3(0.0);
    if(diffuseTerm > 0.0){
        vec3 viewDir = normalize (-p.xyz);
        vec3 halfDir = normalize(viewDir + lightDir);
        float specularTerm = max( 0.0 , pow(dot(n,halfDir),Ns));
        Is = speculaire *vec3(specularTerm);
        Is /= (Ns + 2.0)/(2.0*M_PI);
    }
    
    vec3 color = (0.3*ambiant)+(0.3*diffuse)+(0.3*Is);
    oFragmentColor = vec4( textureColor.rgb * color,textureColor.a);
}
`;

// ---------------------------------------------------------------------------------------------------
// Global variables : textures, FBOs, prog_shaders, mesh, renderer, and a lot of parameters
// ----------------------------------------------------------------------------------------------------


//Skybox
var tex_skybox=null;
var prg_skybox=null;
var rendu_skybox=null;

var tex_bleu=null;
var rendu_skybox_bleu=null;

var cam = -90;

//Soleil
var soleil_rend = null;
var prg_soleil = null;
var soleil_tex = null;
var distance = 0;

//Planètes
var prg_planetes = null;

var mercure_rend = null;
var mercure_tex = null;

var venus_rend = null;
var venus_tex = null;

var terre_rend = null;
var terre_tex = null;
var tex_night = null;

var mars_rend = null;
var mars_tex = null;

var jupiter_rend = null;
var jupiter_tex = null;

var saturne_rend = null;
var saturne_tex = null;

var uranus_rend = null;
var uranus_tex = null;

var neptune_rend = null;
var neptune_tex = null;


// Variable de l'interface
var slider_tps;
var checkbox_deb;
var checkbox_haut_cam;
var slider_ambiant;
var checkbox_mus;
var checkbox_sky;

// Variables de la ceinture d'astéroides
var prg_ast = null;
var nbAsteroids = 1000;
var rock_rend = null;
var ast_tex = null;

// FBO - Glow 
var fbo1 = null;
var fbo2 = null;

// Musique
var myAudio;

// Lune de Jupiter 
// Les tailles seront faites de la meme manières que pour les planètes, tailles réel puis coefficient multiplicateur pour un affichage plus intéressant
// Respect de l'ordre des tailles relatives. 
// Cependant pour la vitesse de rotation / révolution autour de jupiter je me contenterai de le faire de mannière cohérentes entre les différentes lunes. 
// En effet cela donnerait une vitesse bien trop importante à mon sens de tenir compte des vitesses des autres planètes.
var prg_lune = null;
var io_rend = null;
var io_tex = null;
var europe_rend = null;
var europe_tex = null;
var ganymede_rend = null;
var ganymede_tex = null;
var tex_lune;
var taille_lune;
var distance_lune;
var resonance;
var rend_lune;
var dj;
var revoSun;

function init_wgl()
{

    ewgl.continuous_update = true;

    // let milky = "images/skybox/skybox_milky_way_4k.png"
    let stars = "images/skybox/skybox_4k.png"
    // texture cubeMap for the skybox
	tex_skybox = TextureCubeMap();
    tex_skybox.load([stars,stars,stars,stars,stars,stars]).then( update_wgl );
    prg_skybox = ShaderProgram(sky_vert,sky_frag,'sky');
    rendu_skybox = Mesh.Cube().renderer(0,-1,-1);

    // Une autre "skybox"  : fond bleu clair dans le but de rendre visible les planètes sans jouer sur les éclairage
    let bleuCiel = "bleu-ciel.jpg";
    tex_bleu = TextureCubeMap();
    tex_bleu.load([bleuCiel,bleuCiel,bleuCiel,bleuCiel,bleuCiel,bleuCiel]).then(update_wgl);
    prg_skybox = ShaderProgram(sky_vert,sky_frag,'sky');
    rendu_skybox_bleu = Mesh.Cube().renderer(0,-1,-1);
    

    // Create all the shader programs

    prg_soleil = ShaderProgram(soleil_vert,soleil_frag,'soleil');
    prg_planetes = ShaderProgram(planete_vert,planete_frag,'planetes')
    // Create a mesh of a sphere and a renderer
    let soleil = Mesh.Sphere(120);
    // ...
    soleil_tex = Texture2d();
    soleil_tex.load("images/2k_sun.jpg",gl.RGB8);
    soleil_rend = soleil.renderer(1,-1,2);
    

    // Planètes texture (les planètes étant beaucoup plus petites que le soleil on peut diminuer le nombre de triangles)
    let mercure = Mesh.Sphere(30) 
    mercure_tex = Texture2d();
    mercure_tex.load("images/2k_mercury.jpg",gl.RGB8);
    mercure_rend = mercure.renderer(3,5,4);

    let venus = Mesh.Sphere(30) 
    venus_tex = Texture2d();
    venus_tex.load("images/2k_venus.jpg",gl.RGB8);
    venus_rend = venus.renderer(3,5,4);

    //La texture ayant plus de détails (et parce que quand même c'est ici qu'on est)
    // j'augmente le nombre de triangle pour que le rendu soit meilleur
    let terre = Mesh.Sphere(120) 
    tex_night = Texture2d();
    tex_night.load("images/2k_earth_nightmap.jpg",gl.RGB8);
    terre_tex = Texture2d();
    terre_tex.load("images/2k_earth_daymap.jpg",gl.RGB8);
    terre_rend = terre.renderer(3,5,4);
    

    let mars = Mesh.Sphere(30) 
    mars_tex = Texture2d();
    mars_tex.load("images/2k_mars.jpg",gl.RGB8);
    mars_rend = mars.renderer(3,5,4);

    
    let jupiter = Mesh.Sphere(30); 
    jupiter_tex = Texture2d();
    jupiter_tex.load("images/2k_jupiter.jpg",gl.RGB8);
    jupiter_rend = jupiter.renderer(3,5,4);

    let saturne = Mesh.Sphere(30) 
    saturne_tex = Texture2d();
    saturne_tex.load("images/2k_saturn.jpg",gl.RGB8);
    saturne_rend = saturne.renderer(3,5,4);

    let uranus = Mesh.Sphere(30) 
    uranus_tex = Texture2d();
    uranus_tex.load("images/2k_uranus.jpg",gl.RGB8);
    uranus_rend = uranus.renderer(3,5,4);

    let neptune = Mesh.Sphere(30) 
    neptune_tex = Texture2d();
    neptune_tex.load("images/2k_neptune.jpg",gl.RGB8);
    neptune_rend = neptune.renderer(3,5,4);


    // Set the radius and the center of the scene
	ewgl.scene_camera.set_scene_radius(soleil_rend.BB.radius+20.0);
	ewgl.scene_camera.set_scene_center(soleil_rend.BB.center);		

    // Asteroid Belt
    // ----------------------------------------------------------------------------------------------------
        
    // Shader Program for asteroÃ¯ds
    // ...

    ast_tex = Texture2d();
    ast_tex.load("images/rock.png")

    prg_ast = ShaderProgram(ast_vert,ast_frag,"ceinture d'asteroide");

    // Create a typed array to contain all the 4x4 model matrices of each asteroÃ¯d
    const matrixData = new Float32Array(4 * 4 * nbAsteroids);
    var dist = 2.5 * 1.9;
    // For each asteroÃ¯d
    for (let i = 0; i < nbAsteroids; ++i)
    {
        
        var model;
        // Compute a matrix model
        model = Mat4();
        // Put the matrix model a the right place in the typed array
        // On place aléatoirement nos points à une distance à peu près égales du soleil en formant un cercle.
        // Les valeurs d'aléatoire sont choisis arbitrairement après plusieurs tests
        let angle = Math.random()*360;
        let tailleX = Math.random()/75;
        let tailleY = Math.random()/75;
        let tailleZ = Math.random()/75;
        let translateTempo = Matrix.translate(dist*Math.sin(angle)+Math.random()/4-0.5/4,dist*Math.cos(angle)+Math.random()/4-0.5/4,Math.random()/2-0.5/2) ;
        let inclinaisonTempo = Matrix.rotateZ(Math.random(360));
        let tailleTempo = Matrix.scale(tailleX,tailleY,tailleZ);
        model = Matrix.mult(model,translateTempo,inclinaisonTempo,tailleTempo);
        var index = 16 * i;
        matrixData.set(model.data, index);
        
    }
    // VBO for model matrix of each instance
    const matrixBuffer = VBO(matrixData);

    // Load the .obj mesh and use an instanced renderer (with 4 VBO, to recreate a 4x4 matrix) to get a lot of asteroÃ¯ds
    Mesh.loadObjFile("texture/rock/rock.obj").then((meshes) =>
    {
        rock_rend = meshes[0].instanced_renderer([
            [3, matrixBuffer, 1, 4 * 4, 0 * 4, 4],
            [4, matrixBuffer, 1, 4 * 4, 1 * 4, 4],
            [5, matrixBuffer, 1, 4 * 4, 2 * 4, 4],
            [6, matrixBuffer, 1, 4 * 4, 3 * 4, 4]],
            0, 1, 2);
    });
    
    
    // --------------------------------------------------------------------------------------------------------
    //                                  GLOW
    // --------------------------------------------------------------------------------------------------------



    // User interface
	UserInterface.begin(false);
        slider_tps = UserInterface.add_slider("Accélérateur du temps",0,100,1,update_wgl);        
        checkbox_deb = UserInterface.add_check_box(" Position de départ à l\'arrêt",false,update_wgl);
        UserInterface.use_field_set("H","Position de la caméra, de face par défaut");
            checkbox_haut_cam = UserInterface.add_check_box("Au-dessus",false,update_wgl);
        UserInterface.end_use();
        slider_ambiant = UserInterface.add_slider("Lumière ambiante (réelle à 0)",0,10,0,update_wgl);
        checkbox_mus = UserInterface.add_check_box("Couper la musique",false,update_wgl);
        checkbox_sky = UserInterface.add_check_box("Fond bleu ciel",false,update_wgl);
    UserInterface.end();

    ewgl.scene_camera.set_scene_center(Vec3(0,0,0));
    
    
    // ------------------------------------------------------------------------------------------
    //                                     Ajouts
    // ------------------------------------------------------------------------------------------
    
    // Musique : Interstellar Main Theme - Extra Extended - Soundtrack by  Hans Zimmer 
    myAudio = document.createElement("audio");
    myAudio.src = "music/music.mp3"; 
    myAudio.play();

    
    // Lunes de jupiter (3 d'entres elles)
    prg_lune = ShaderProgram(lune_vert,lune_frag,"Lunes");

    let io = Mesh.Sphere(20); 
    io_tex = Texture2d();
    io_tex.load("texture/LuneJupiter/io.jpg",gl.RGB8);
    io_rend = io.renderer(1,2,3);
    
    let europe = Mesh.Sphere(20); 
    europe_tex = Texture2d();
    europe_tex.load("texture/LuneJupiter/europe.jpg",gl.RGB8);
    europe_rend = europe.renderer(1,2,3);

    let ganymede = Mesh.Sphere(20) ;
    ganymede_tex = Texture2d();
    ganymede_tex.load("texture/LuneJupiter/ganymede.png",gl.RGB8);
    ganymede_rend = ganymede.renderer(1,2,3);

    tex_lune = [io_tex,europe_tex,ganymede_tex];
    taille_lune = [0.0029*25.0,0.0024*25.0,0.0041*25.0];
    distance_lune = [0.4*1.5,0.6*1.4,1.0*1.2];
    resonance = [1,2,4]; // vitesse de révolution les une par rapport aux autres
    rend_lune = [io_rend,europe_rend,ganymede_rend];

    dj = 5.21 * 1.2;
    revoSun = 11.87 * 365.0;
    
    gl.clearColor(0, 0, 0 , 1);
}

function getRandomMax(max)
{
	return Math.random() * Math.floor(max);
}

function getRandomMinMax(min, max)
{
	return Math.random() * (max - min) + min;
}

/*
function resize_wgl(w,h)
{
    let d = Math.pow(2, 3);
    // 
	fbo1.resize(w/d,h/d);
	fbo2.resize(w/d,h/d);
	// Faire varier l'intensiter selon la taille
	// glow_intensity = 300 - ((w/100) * (h/100));
}
*/
// -------------------------------------------------------------------------------------------------------------------------------------
//  DRAW
// -------------------------------------------------------------------------------------------------------------------------------------
var appel = 0;



//-----------------------------------------------------------------------
// 
function createPlanetUniforms(pTaille,pDistance,pRevo,pRota, pIncli )
{
    
    Uniforms.uProjectionMatrix = ewgl.scene_camera.get_projection_matrix();
    Uniforms.uViewMatrix = ewgl.scene_camera.get_view_matrix();


    // Taille et distance au soleil de la planète
    Uniforms.taille = pTaille;
    distance = pDistance;

    //position de départ face au soleil en modifiant l'inclinaison pour que la texture soit appliqué correctement
    Uniforms.uSensMatrix=cam;
    //Lumière ambiante, identique pour toute la scène
    Uniforms.uAmbiant = slider_ambiant.value/10;

    //On reste au centre du repère pour faire les modifications par rapport au soleil à l'objet, rotation et inclinaison
    let rota = Matrix.rotateZ(365*(1/pRota) * appel);
    Uniforms.uRotationMatrix = rota;
    let incli = Matrix.rotateY(pIncli);
    Uniforms.uInclinaisonMatrix = incli;

    //On place la planète à sa position pour faire la révolution
    let tr = Matrix.translate(distance,0,0);
    Uniforms.uTranslateMatrix = tr;
    let revo = Matrix.rotateZ(10.0*(365.0/pRevo) * appel);
    Uniforms.uRevolutionMatrix = revo;

    let modelMatrix = Matrix.mult(cam ,revo,tr,incli,rota,pTaille);

    Uniforms.uNormalMatrix_World = modelMatrix.inverse3transpose();

}


function draw_wgl()
{	
	gl.clearColor(0,0,0,0);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	gl.enable(gl.DEPTH_TEST);


    // Rendu de la skkybox sélectionnée. 
    
    prg_skybox.bind();
	Uniforms.projectionviewMatrix = ewgl.scene_camera.get_matrix_for_skybox();
    if(checkbox_sky.checked){
        Uniforms.TU = tex_bleu.bind(0);
        rendu_skybox_bleu.draw(gl.TRIANGLES);
    }else{
        Uniforms.TU = tex_skybox.bind(0);
        rendu_skybox.draw(gl.TRIANGLES);
    }
	
	

    // ---------------------------------------------------------------------------
    //                  Intéraction avec l'interface
    // ---------------------------------------------------------------------------

    // Vue de dessus/face de la scene

    if(checkbox_haut_cam.checked){
        cam = Matrix.rotateX(0);
    }else
    {
        cam = Matrix.rotateX(-90);
    }

    // Couper/Relance la musique

    if(checkbox_mus.checked){
        myAudio.pause();
    }else{
        myAudio.play();
    }
    

    // -------------------------------------------------
    //                      Soleil
    // -------------------------------------------------
    prg_soleil.bind();
    Uniforms.uProjectionMatrix = ewgl.scene_camera.get_projection_matrix();

    Uniforms.uViewMatrix = ewgl.scene_camera.get_view_matrix();
    Uniforms.uSensMatrix=cam;
    Uniforms.uSampler = soleil_tex.bind();

    soleil_rend.draw(gl.TRIANGLES);
    
    //----------------Position de départ à l'arrêt des planètes------------------------
    // Pensez à décocher la case pour pouvoir reprendre le contrôle sur la vitesse.
    if(checkbox_deb.checked){
        slider_tps.value = 0;
        appel = 0;
    }

    

    //-----------------Distance au soleil et Taille------------------------------------
    // Les dimensions relatives sont arrondis aux millième supérieur
    // Pour les distance on va raisonner en unité astromique, on suppose un cercle parfait (distance fixe au soleil) et non une elipse
    // Les valeurs de distances et tailles à gauche sont celles respectant les dimensions relatives
    // Le coefficient derriere est la triche que j'apporte pour plus de lisibilité.
    // Les valeurs ont été choisies dans le but d'essayer de préserver une cohérence (très) relative
    // Tout en permettant un affichage visible.

    //---------------------Rotation et Révolution--------------------------------------
    // Le référence sera la terre pour la periode sidérale comme pour le période de révolution.
    // Pour avoir un affichage qui me parait judicieux : Je divise par 10 le nombre de période sidérale réalisé en une période de révolution
    // Exemple : La période sidérale de la terre est d'1 jour (à l'arrondi près) sa période de révolution de 365 jours
    //  On doit donc faire une rotation 365 fois plus rapide que la révolution. Avec ma triche ce sera 36,5 fois plus rapide.

    //------------------------------ variable de simulation du temps ------------------------------------
    //incrémenter par chaque passage dans le draw, permet de faire mouvoir les objets.
     // Cette variable est commune à toute les planètes et pourra être modifié avec l'interface
    
    appel = appel + 0.01 * slider_tps.value;
    //  -----------------------------------MERCURE-------------------------------------
    prg_planetes.bind(); 
    createPlanetUniforms(
        0.004 * 25.0,   // taille
        0.38 * 4.0,     // distance
        88,           // revo
        58.64,          // rota
        0.1            // inclinaison
        )   

    // On a une texture de nuit dans le shader (pour la terre) donc on envoie 2 fois la texture de base pour toutes les planètes
    // hormis la terre. Car on doit utiliser l'uniform même de manière 'fictive' .
    let tex = mercure_tex.bind();
    Uniforms.uSampler = tex;
    Uniforms.uSamplerNight = tex;
    // Rendu de la planète
    mercure_rend.draw(gl.TRIANGLES);

    //-------------------------------------VENUS-----------------------------------------
    prg_planetes.bind();  
    tex = venus_tex.bind();
    Uniforms.uSampler = tex;
    Uniforms.uSamplerNight = tex;

    createPlanetUniforms(
        0.009 * 18.0,   // taille
        0.7 * 3.0,     // distance
        224.7,          // revolution
        -243.01,       // rotation
        177.0          // inclinaison
        );
    
    venus_rend.draw(gl.TRIANGLES);


    //-------------------------------------MARS--------------------------------------------- 
    prg_planetes.bind();
    tex = mars_tex.bind();
    Uniforms.uSampler = tex;
    Uniforms.uSamplerNight = tex;

    createPlanetUniforms(
        0.005 * 25.0,   // taille
        1.52 * 2.6,     // distance
        689,          // revolution
        1.03,       // rotation
        25.0          // inclinaison
        );

    
    mars_rend.draw(gl.TRIANGLES);


    //-----------------------------------JUPITER-------------------------------------------- 
    prg_planetes.bind();
    tex = jupiter_tex.bind();
    Uniforms.uSampler = tex;
    Uniforms.uSamplerNight = tex;

    createPlanetUniforms(
        0.101 * 5.0,    // taille
        5.21 * 1.2,     // distance
        11.87 * 365.0,          // revolution
        0.41,           // rotation
        3.0           // inclinaison
        )   

    jupiter_rend.draw(gl.TRIANGLES);





    //------------------------------------SATURNE-------------------------------------------
    prg_planetes.bind();
    tex = saturne_tex.bind();
    Uniforms.uSampler = tex;
    Uniforms.uSamplerNight = tex;

    createPlanetUniforms(
        0.084 * 5.0,    // taille
        9.54 *0.95,     // distance
        29.45 * 365.0,          // revolution
        0.44,           // rotation
        27           // inclinaison
        ) ;

    saturne_rend.draw(gl.TRIANGLES);

    //-----------------------------------URANUS---------------------------------------------
    prg_planetes.bind();
    tex = uranus_tex.bind();
    Uniforms.uSampler = tex;
    Uniforms.uSamplerNight = tex;

    createPlanetUniforms(
        0.037 *10.0,    // taille
        19.13 * 0.65,     // distance
        84.07 * 365.0,          // revolution
        0.718,           // rotation
        98           // inclinaison
        ) ;

    uranus_rend.draw(gl.TRIANGLES);

    //----------------------------------NEPTUNE-------------------------------------------- 
    prg_planetes.bind();
    tex = neptune_tex.bind();
    Uniforms.uSampler = tex;
    Uniforms.uSamplerNight = tex;

    createPlanetUniforms(
        0.036 *10.0,    // taille
        30 * 0.6,     // distance
        164.89 * 365.0  ,          // revolution
        0.67,           // rotation
        30           // inclinaison
        );  
    neptune_rend.draw(gl.TRIANGLES);


    

    // ------------------------------Asteroides---------------------------------------------
    prg_ast.bind();
    Uniforms.uProjectionMatrix = ewgl.scene_camera.get_projection_matrix();
    Uniforms.uViewMatrix = ewgl.scene_camera.get_view_matrix();
    Uniforms.uSensMatrix = cam;
    Uniforms.uRevolutionMatrix = Matrix.rotateZ(100*appel);
    Uniforms.uSampler = ast_tex.bind();
    if(rock_rend!=null){
        rock_rend.draw(gl.TRIANGLES,nbAsteroids);
    }

    //-------------------------------------Lune de Jupiter-----------------------------------------
    
        // Leurs inclinaisons est négligeable.
        for(var i=0;i<3;i++){
            prg_lune.bind();
            Uniforms.uProjectionMatrix = ewgl.scene_camera.get_projection_matrix();
            Uniforms.uViewMatrix = ewgl.scene_camera.get_view_matrix();
            Uniforms.uSampler = tex_lune[i].bind();
            Uniforms.taille = taille_lune[i];
            distance = distance_lune[i];
            let rota = Matrix.rotateZ((50.0/resonance[i])*appel);               // Rotation sur elle-meme en origine du repère        
            let trJupi = Matrix.translate(dj,0,0);                              // translation à la position de Jupiter
            let revoSunJ = Matrix.rotateZ(10.0*(365.0/revoSun)*appel);          // Revolution autour du soleil à la meme vitesse que jupiter
            let tr = Matrix.translate(Math.sqrt(distance)*Math.cos(appel/resonance[i]),Math.sqrt(distance)*Math.sin(appel/resonance[i]),0);    // Translation à la distance voulue de Jupiter + fonction cos/sin pour rotation
            let modelMatrix = Matrix.mult(cam,tr,revoSunJ,trJupi,rota);
            Uniforms.uModMatrix = modelMatrix;
            Uniforms.uNormalMatrix = modelMatrix.inverse3transpose();
            rend_lune[i].draw(gl.TRIANGLES);
        }

        //On utilise la translation pour faire la révolution => le but est de préserver notre distance à Jupiter. 
        // Les fonctions cosinus et sinus permettent de créer l'effet de révolution des lunes autour de Jupiter.

 
    
    //-----------------------------------TERRE--------------------------------------------
    prg_planetes.bind();
    Uniforms.uSampler = terre_tex.bind(0);
    Uniforms.uSamplerNight = tex_night.bind(1);

    createPlanetUniforms(
        0.01 *18.0,    // taille
        1.0 * 3.0,     // distance
        365,          // revolution
        1,           // rotation
        23.0           // inclinaison
        );  
    terre_rend.draw(gl.TRIANGLES);
 
    gl.useProgram(null);
}

function mousedown_wgl(ev)
{
    // if you want to use mouse interaction
}

function onkeydown_wgl(k)
{
    // if you want to use keyboard interaction
}

ewgl.launch_3d();
