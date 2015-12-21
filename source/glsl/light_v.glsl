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
    vec3 ambient_color;
    vec3 diffuse_color;
    vec3 specular_color;
    vec3 direction;
    vec3 position;
    vec3 att_factors;
    float spot_exp;
    float spot_cutoff_angle;
} light;

// constant variable
const float c_NEGONE = -1.0;
const float c_ZERO = 0.0;
const float c_ONE = 1.0;

// material color properties, 0:ambient 1:diffuse 2:specular 3:emmisive
uniform vec4 u_Arr_Material[4];
// light color properties, 0:ambient 1:diffuse 2:specular 3:direction 4:position 5:att_factors
uniform vec3 u_Arr_Light[6];
// light other properties, 0: specular exponent 1: spot exponent 2: spot cutoff angle
uniform f u_Arr_Exp[3];
// is direct light or not
uniform bool u_b_direct_light;
// is compute dist attenuation
uniform bool u_b_dist_att;
// model-view-project matrix to calculate final position
uniform mat4 u_MvpMatrix;
// model-view matrix to calculate view position
uniform mat4 u_MvMatrix;
// the inversed&transposed model-view matrix to calculate normal
uniform mat4 u_MvInvertMatrix;

attribute vec3 a_Position; 
attribute vec3 a_Normal;

// transfer to fragment shader to calculate texture coordinate
varying vec3 v_Normal;
// calculated vertex color
varying vec4 v_Color;

vec4 computeColor(normal) {

    material = Material(
        vec4(u_Arr_Material[0]),
        vec4(u_Arr_Material[1]),
        vec4(u_Arr_Material[2]),
        vec4(u_Arr_Material[3]),
        float(u_Arr_Exp[0])
    );

    light = Light(
        vec3(u_Arr_Light[0]),
        vec3(u_Arr_Light[1]),
        vec3(u_Arr_Light[2]),
        vec3(u_Arr_Light[3]),
        vec3(u_Arr_Light[4]),
        vec3(u_Arr_Light[5]),
        float(u_Arr_Exp[1]),
        float(u_Arr_Exp[2])
    );

    vec4 computed_color = vec4(c_ZERO, c_ZERO, c_ZERO, c_ZERO);
    vec3 light_direction;
    vec3 halfplane;
    float ndotl;
    float ndoth;

    if (u_b_direct_light) {
        // directional light
        light_direction = material.direction;
        halfplane = normalize(light_direction + vec3(c_ZERO, c_ZERO, c_ZERO));
        ndotl = max(c_ZERO, dot(normal, light_direction));
        ndoth = max(c_ZERO, dot(normal, halfplane));
        // ambient color
        computed_color += (light.ambient_color * material.ambient_color);
        // diffuse color
        computed_color += (ndotl * light.diffuse_color * material.diffuse_color);
        // specular color
        if (ndoth > c_ZERO) {
            computed_color += (pow(ndoth, material.specular_exp) * material.specular_color * light.specular_color);
        }
        return computed_color;
    } else {
        // spot light
        light_direction = normalized(light.position - u_MvMatrix * a_Position);
        halfplane = normalized(light_direction + vec3(c_ZERO, c_ZERO, c_ZERO));
        float att_factor = c_ONE;
        if (u_b_dist_att) {
            // compute distance attenuate factor
            vec3 att_dist;
            att_dist.x = c_ONE;
            att_dist.z = dot(light_direction, light_direction);
            att_dist.y = sprt(att_dist.z);
            att_factor = c_ONE / dot(att_dist, light.att_factors);
        }

        if (light.spot_cutoff_angle < 180.0) {
            // compute spot cutoff factor
            float spot_factor = dot(-light_direction, light.direction);
            if (spot_factor >= cos(radians(light.spot_cutoff_angle))) {
                spot_factor = pow(spot_factor, light.spot_exp);
            }
            else {
                spot_factor = c_ZERO;
            }
            att_factor *= spot_factor;
        }

        if (att_factor > c_ZERO) {
            computed_color += (light.ambient_color * material.ambient_color);
            ndotl = max(c_ZERO, dot(normal, light_direction));
            computed_color += (ndotl * light.diffuse_color * material.diffuse_color);
            ndoth = max(c_ZERO, dot(normal, halfplane));
            if (ndoth > c_ZERO) {
                computed_color += (pow(ndoth, material.specular_exp) * material.specular_color * light.specular_color);
            }
            // multiply att_factor
            computed_color *= att_factor;
        }

        return computed_color;
    }
}

void main(void) { 
    gl_Position = u_MvpMatrix * a_Position;
    v_Normal = normalized(u_MvInvertMatrix * a_Normal);
    v_Color = computeColor(v_Normal);
     
}