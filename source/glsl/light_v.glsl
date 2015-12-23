/*
 * calculate position, normal, vetex color
 */
// private structures
struct Material {
    vec4 ambient_color;
    vec4 diffuse_color;
    vec4 specular_color;
    vec4 emmisive_color;
    // specular exponent
    float specular_exp;
} material;

struct Light {
    vec4 ambient_color;
    vec4 diffuse_color;
    vec4 specular_color;
    vec4 direction;
    vec4 position;
    vec3 att_factors;
    float spot_exp;
    float spot_cutoff_angle;
} light;

// constant variable
const float c_NEGONE = -1.0;
const float c_ZERO = 0.0;
const float c_ONE = 1.0;

// material color properties, 0:ambient 1:diffuse 2:specular 3:emmisive
// light color properties, 0:ambient 1:diffuse 2:specular 3:direction 4:position 5:att_factors
uniform mat4 u_mat_mtl;
uniform mat4 u_mat_lgt;
uniform vec4 u_position;
uniform vec3 u_att;

// light other properties, 0: specular exponent 1: spot exponent 2: spot cutoff angle
uniform vec3 u_Arr_Exp;
// is direct light or not
uniform int u_b_direct_light;
// is compute dist attenuation
uniform int u_b_dist_att;
// model-view-project matrix to calculate final position
uniform mat4 u_MvpMatrix;
// model-view matrix to calculate view position
uniform mat4 u_MvMatrix;
// the inversed&transposed model-view matrix to calculate normal
uniform mat4 u_MvInvertMatrix;

attribute vec4 a_Position; 
attribute vec4 a_Normal;

// transfer to fragment shader to calculate texture coordinate
varying vec4 v_Normal;
// calculated vertex color
varying vec4 v_Color;

vec4 computeColor(vec4 normal) {

    material = Material(
        vec4(u_mat_mtl[0]),
        vec4(u_mat_mtl[1]),
        vec4(u_mat_mtl[2]),
        vec4(u_mat_mtl[3]),
        float(u_Arr_Exp.x)
    );

    light = Light(
        vec4(u_mat_lgt[0]),
        vec4(u_mat_lgt[1]),
        vec4(u_mat_lgt[2]),
        vec4(u_mat_lgt[3]),
        u_position,
        u_att,
        float(u_Arr_Exp.y),
        float(u_Arr_Exp.z)
    );

    vec4 computed_color = vec4(c_ZERO, c_ZERO, c_ZERO, c_ZERO);
    vec4 light_direction;
    vec4 halfplane;
    float ndotl;
    float ndoth;

    // if (bool(u_b_direct_light)) {
        // directional light
        light_direction = normalize(light.direction);
        halfplane = normalize(light_direction + vec4(c_ZERO, c_ZERO, c_ZERO, c_ONE));
        ndotl = max(c_ZERO, dot(normal, light_direction));
        ndoth = max(c_ZERO, dot(normal, halfplane));
        // ambient color
        computed_color += material.ambient_color * light.ambient_color;
        
        // diffuse color
        computed_color += (ndotl * light.diffuse_color * material.diffuse_color);
        // // specular color
        // if (ndoth > c_ZERO) {
        //     computed_color += (pow(ndoth, material.specular_exp) * material.specular_color * light.specular_color);
        // }
        return computed_color;
    // } else {
    //     // spot light
    //     light_direction = normalize(light.position - u_MvMatrix * a_Position);
    //     halfplane = normalize(light_direction + vec4(c_ZERO, c_ZERO, c_ZERO, c_ONE));
    //     float att_factor = c_ONE;
    //     if (bool(u_b_dist_att)) {
    //         // compute distance attenuate factor
    //         vec3 att_dist;
    //         att_dist.x = c_ONE;
    //         att_dist.z = dot(light_direction, light_direction);
    //         att_dist.y = sqrt(att_dist.z);
    //         att_factor = c_ONE / dot(att_dist, light.att_factors);
    //     }

    //     if (light.spot_cutoff_angle < 180.0) {
    //         // compute spot cutoff factor
    //         float spot_factor = dot(-light_direction, light.direction);
    //         if (spot_factor >= cos(radians(light.spot_cutoff_angle))) {
    //             spot_factor = pow(spot_factor, light.spot_exp);
    //         }
    //         else {
    //             spot_factor = c_ZERO;
    //         }
    //         att_factor *= spot_factor;
    //     }

    //     if (att_factor > c_ZERO) {
    //         computed_color += (light.ambient_color * material.ambient_color);
    //         ndotl = max(c_ZERO, dot(normal, light_direction));
    //         computed_color += (ndotl * light.diffuse_color * material.diffuse_color);
    //         ndoth = max(c_ZERO, dot(normal, halfplane));
    //         if (ndoth > c_ZERO) {
    //             computed_color += (pow(ndoth, material.specular_exp) * material.specular_color * light.specular_color);
    //         }
    //         // multiply att_factor
    //         computed_color *= att_factor;
    //     }

    //     return computed_color;
    // }
}

void main(void) { 
    gl_Position = u_MvpMatrix * a_Position;
    v_Normal = normalize(u_MvInvertMatrix * a_Normal);
    v_Color = computeColor(v_Normal);
     
}