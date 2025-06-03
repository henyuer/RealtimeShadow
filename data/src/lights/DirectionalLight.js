class DirectionalLight {

    constructor(lightIntensity, lightColor, lightPos, focalPoint, lightUp, hasShadowMap, gl) {
        this.mesh = Mesh.cube(setTransform(0, 0, 0, 0.2, 0.2, 0.2, 0));
        this.mat = new EmissiveMaterial(lightIntensity, lightColor);
        this.lightPos = lightPos;
        this.focalPoint = focalPoint;
        this.lightUp = lightUp

        this.hasShadowMap = hasShadowMap;
        this.fbo = new FBO(gl);
        if (!this.fbo) {
            console.log("无法设置帧缓冲区对象");
            return;
        }

        this.augularSpeed=1.0;
        this.radius=Math.sqrt((lightPos[0]-focalPoint[0])**2+(lightPos[1]-focalPoint[1])**2);
        this.currentAngle=0;

    }

    lightMoveRound(deltaTime){
        if(this.currentAngle>2*Math.PI)
            this.currentAngle-=2*Math.PI;
        this.currentAngle+=this.augularSpeed*deltaTime;
        this.lightPos[0]=this.focalPoint[0]+this.radius*Math.sin(this.currentAngle);
        this.lightPos[2]=this.focalPoint[2]+this.radius*Math.cos(this.currentAngle);
    }

    CalcLightMVP(translate, scale) {
        let lightMVP = mat4.create();
        let modelMatrix = mat4.create();
        let viewMatrix = mat4.create();
        let projectionMatrix = mat4.create();

        // Model transform
        mat4.translate(modelMatrix, modelMatrix, translate);
        mat4.scale(modelMatrix, modelMatrix, scale);

        // View transform
        mat4.lookAt(viewMatrix, this.lightPos, this.focalPoint, this.lightUp);

        // Projection transform
        let left = -1000;
        let right = 1000;
        let bottom = -1000;
        let top = 1000;
        let near = 0.1;
        let far = 1000;
        mat4.ortho(projectionMatrix, left, right, bottom, top, near, far);

        mat4.multiply(lightMVP, projectionMatrix, viewMatrix);
        mat4.multiply(lightMVP, lightMVP, modelMatrix);

        return lightMVP;
    }
}
