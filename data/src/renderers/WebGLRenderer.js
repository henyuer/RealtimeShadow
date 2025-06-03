class WebGLRenderer {
    meshes = [];
    shadowMeshes = [];
    lights = [];

    constructor(gl, camera) {
        this.gl = gl;
        this.camera = camera;
    }

    addLight(light) {
        this.lights.push({
            entity: light,
            meshRender: new MeshRender(this.gl, light.mesh, light.mat)
        });
    }
    addMeshRender(mesh) { this.meshes.push(mesh); }
    addShadowMeshRender(mesh) { this.shadowMeshes.push(mesh); }

    update(deltaTime)
    {
        for (let i=0;i<this.lights.length;i++)
        {
            this.lights[i].entity.lightMoveRound(deltaTime);
        }
    }

    render() {
        const gl = this.gl;

        gl.clearColor(0.0, 0.0, 0.0, 1.0); // Clear to black, fully opaque
        gl.clearDepth(1.0); // Clear everything
        gl.enable(gl.DEPTH_TEST); // Enable depth testing
        gl.depthFunc(gl.LEQUAL); // Near things obscure far things

        console.assert(this.lights.length != 0, "No light");
        console.assert(this.lights.length == 1, "Multiple lights");

        for (let l = 0; l < this.lights.length; l++) {
            // Draw light
            // TODO: Support all kinds of transform
            this.lights[l].meshRender.mesh.transform.translate = this.lights[l].entity.lightPos;
            this.lights[l].meshRender.draw(this.camera);

            // Shadow pass
            if (this.lights[l].entity.hasShadowMap == true) {
                for (let i = 0; i < this.shadowMeshes.length; i++) {
                    this.gl.useProgram(this.shadowMeshes[i].shader.program.glShaderProgram);
                    let translate=this.shadowMeshes[i].material.translate;
                    let scale=this.shadowMeshes[i].material.scale;
                    let mvp=this.lights[l].entity.CalcLightMVP(translate,scale);
                    this.gl.uniformMatrix4fv(this.shadowMeshes[i].shader.program.uniforms.uLightMVP,false,mvp);

                    this.shadowMeshes[i].draw(this.camera);
                }
            }

            // Camera pass
            for (let i = 0; i < this.meshes.length; i++) {
                this.gl.useProgram(this.meshes[i].shader.program.glShaderProgram);
                this.gl.uniform3fv(this.meshes[i].shader.program.uniforms.uLightPos, this.lights[l].entity.lightPos);
                let translate=this.meshes[i].material.translate;
                let scale=this.meshes[i].material.scale;
                this.gl.uniformMatrix4fv(this.meshes[i].shader.program.uniforms.uLightMVP,false,this.lights[l].entity.CalcLightMVP(translate,scale));
                this.meshes[i].draw(this.camera);
            }
        }
    }


}