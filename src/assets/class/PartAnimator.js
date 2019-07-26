var animPatterns =
{
    "once":[
        {x:1, y:1, z:1, wait:0, dur:300},
        {x:0, y:0, z:0, wait:0, dur:300}
    ],
    "nod":[
        {x:1, y:1, z:1, wait:0, dur:200},
        {x:0, y:0, z:0, wait:0, dur:200},
        {x:1, y:1, z:1, wait:0, dur:200},
        {x:0, y:0, z:0, wait:0, dur:200}
    ],
    "shake":[
        {x:1, y:1, z:1, wait:0, dur:200},
        {x:-1, y:-1, z:-1, wait:0, dur:300},
        {x:1, y:1, z:1, wait:0, dur:300},
        {x:-1, y:-1, z:-1, wait:0, dur:300},
        {x:0, y:0, z:0, wait:0, dur:200}
    ]
};

class PartAnimator extends THREE.Object3D {
    constructor(partClass, target, specAnim, partId) {
        super();
        this.partClass = partClass;
        this.partId = partId;
        this.target = target;
        this.specAnim = specAnim;
        this.isMirrored;
        this.nFrame = 0;
        this.tween = undefined;
        this.initRot = {x:target.rotation._x, y:target.rotation._y, z:target.rotation._z};
        this.count = 0;
        this.textureLoader = new THREE.TextureLoader();
        this.texDict = {}; // texture pre load dict
        this.targetMaterial;
        // texture
        this.texSheet;
        this.isTexPlaying = false;
        this.texPlayIndex = 0; // texture play current index
        // concrete sequence
        this.seqSheet;
        this.isSeqPlaying = false;
        this.seqPlayIndex = 0;
        this.seqObjects = {};
        let self = this;

        eventHub.addEventListener("onFrame", function(event) {
            self.nFrame ++;
            self.onFrame();
        });

        let rots = {x:0, y:0, z:0};

        let onUpdate = function () {
            self.target.rotation.set(
                rots.x * Math.PI / 180 + self.initRot.x, 
                rots.y * Math.PI / 180 + self.initRot.y, 
                rots.z * Math.PI / 180 + self.initRot.z);
        }

        this.tween = new TWEEN.Tween(rots)
            .onUpdate(onUpdate)
            .easing(TWEEN.Easing.Sinusoidal.InOut);

        // check textures and load; check concrete sequence and load
        for (let key in this.specAnim) { // key: ok, no
            let content = this.specAnim[key];
            // load "texture" key/value
            if (content.texture != undefined) {
                this.loadTexture(content.texture, partId);
            }
            // load "seq" key/value
            if (content.seq != undefined) {
                this.loadSeq(content.seq, partId);
            }
        }
    }

    // "sheet": {
    //     "anim": {
    //         "hi": {
    //             "texture": [
    //                 {
    //                     "dur": 200,
    //                     "index": 1
    //                 },
    //                 {
    //                     "dur": 200,
    //                     "index": 0
    //                 }
    //             ]
    //         }
    //     }
    // }
    // textureArray: "texture" array
    loadTexture(textureArray, partId) {
        for (let i = 0; i < textureArray.length; i++) {
            let entry = textureArray[i]; // {"index":1, "dur":0.5}
            let filename = partId + "_" + entry.index;
            if (entry.index == 0) filename = partId;
            if (this.texDict[filename] == undefined) {
                let targetTexture = this.textureLoader.load('assets/models/' + filename + '.png');
                this.texDict[filename] = targetTexture;
            }
        }
    }

    // "sheet": {
    //     "anim": {
    //         "hi": {
    //             "seq": [
    //                 {
    //                     "dur": 200,
    //                     "index": 1
    //                 },
    //                 {
    //                     "dur": 200,
    //                     "index": 0
    //                 }
    //             ]
    //         }
    //     }
    // }
    loadSeq(seqArray, partId) {
        for (let i = 0; i < seqArray.length; i++) {
            let entry = seqArray[i]; // {"index":1, "dur":0.5}
            let partClass = Util.partIdToClass(partId);
            let objectName = partClass + "_" + entry.index; // eyeL_1
            if (entry.index == 0) objectName = partClass; // eyeL
            let object = Util.findChildByName(this.target.children, objectName);
            if (object != undefined) {
                if (entry.index == 0) object.visible = true;
                else object.visible = false;
                if (this.seqObjects[entry.index] == undefined) {
                    this.seqObjects[entry.index] = object;
                }
            }
            else {
                console.log("Warning: seq object not found:" + objectName);
            }
        }
    }

    start(pattern, direction) {
        this.direction = direction;
        let sheet = animPatterns[pattern];
        if (sheet == undefined) return;
        
        let length = sheet.length;
        let index = 0;
        let mirrorVector = [1, 1, 1];
        if (this.isMirrored == "x")
            mirrorVector = [1, -1, -1];
        let self = this;

        let onComplete = function () {
            if (index < length) {
                let entry = sheet[index];
                let rotDest = {
                    x:entry.x * self.direction[0] * mirrorVector[0],
                    y:entry.y * self.direction[1] * mirrorVector[1],
                    z:entry.z * self.direction[2] * mirrorVector[2]
                };
                self.tween.to(rotDest, entry.dur)
                    .delay(entry.wait)
                    .start();
                index++;
            }
        }

        this.tween.to({x:0, y:0, z:0}, 0)
            .delay(0)
            .onComplete(onComplete)
            .start();
    }

    playNextTex() {
        let sheetEntry = this.texSheet[this.texPlayIndex]; // {"index":1, "dur":0.5}
        let filename = this.partId + "_" + sheetEntry.index; // mouth_a0000200_1
        if (sheetEntry.index == 0) filename = this.partId;
        if (this.texDict[filename] != undefined) {
            this.targetMaterial.map = this.texDict[filename];
            this.targetMaterial.map.needsUpdate = true;
        }
        let self = this;
        this.texPlayIndex++;
        if (this.texPlayIndex < this.texSheet.length) {
            setTimeout(function() {
                self.playNextTex();
            }, sheetEntry.dur);
        } else {
            this.isTexPlaying = false;
        }
    }

    startTex(textureSheet) {
        if (!this.isTexPlaying) {
            this.isTexPlaying = true;
            this.texSheet = textureSheet;
            this.texPlayIndex = 0;
            let matName = Util.trimLR(this.partClass);
            this.targetMaterial = Util.findChildMaterail(this.target.children, matName);
            if (this.targetMaterial != undefined) {
                this.playNextTex();
            }
        }
    }

    playNextSeq() {
        let sheetEntry = this.seqSheet[this.seqPlayIndex]; // {"index":1, "dur":0.5}

        // if index is 1, only turn eyeL_1's visible to true
        for (let key in this.seqObjects) {
            if (this.seqObjects.hasOwnProperty(key)) {
                let object = this.seqObjects[key];
                object.visible = false;
                if (key == sheetEntry.index) object.visible = true;
            }
        }
        let self = this;
        this.seqPlayIndex++;
        if (this.seqPlayIndex < this.seqSheet.length) {
            setTimeout(function() {
                self.playNextSeq();
            }, sheetEntry.dur);
        } else {
            this.isSeqPlaying = false;
        }
    }

    startSeq(seqSheet) {
        if (!this.isSeqPlaying) {
            this.isSeqPlaying = true;
            this.seqSheet = seqSheet;
            this.seqPlayIndex = 0;
            this.playNextSeq();
        }
    }

    onFrame() {
        var whatever = 7;
    }

}