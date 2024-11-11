import * as THREE from "three";
import { gsap } from "gsap";
import { GLTF, GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

import { Source } from "../sources";
import EventEmitter from "./EventEmitter";
import Overlay from "../meshes/Overlay";

export default class Resources extends EventEmitter {
	sources: Source[];
	items: any;
	toLoad: number;
	loaded: number;
	overlay?: Overlay;

	loadingManager?: THREE.LoadingManager;

	loaders?: {
		gltfLoader: GLTFLoader;
		textureLoader: THREE.TextureLoader;
		cubeTextureLoader: THREE.CubeTextureLoader;
	};

	sceneReady = false;

	constructor(sources: Source[]) {
		/**
		 * Call the EventEmitter constructor
		 */
		super();

		this.sources = sources;

		this.items = {}; // { name: file }
		this.toLoad = this.sources.length;
		this.loaded = 0;
		this.overlay = new Overlay();

		this.setLoaders();
		this.startLoading();
	}

	setLoaders() {
		const loadingBaElement: HTMLElement =
			document.querySelector(".loading-bar")!;
		const loadingManager = new THREE.LoadingManager(
			() => {
				gsap.delayedCall(0.5, () => {
					gsap.to(this.overlay!.material!.uniforms.uAlpha, {
						duration: 3,
						value: 0,
						ease: "power3.inOut",
					});
					loadingBaElement.classList.add("ended");
					loadingBaElement.style.transform = "";
				});
				gsap.delayedCall(3, () => (this.sceneReady = true));
			},
			(_, loaded, total) => {
				const progress = loaded / total;
				loadingBaElement!.style.transform = `scaleX(${progress})`;
			}
		);

		this.loaders = {
			gltfLoader: new GLTFLoader(loadingManager),
			textureLoader: new THREE.TextureLoader(loadingManager),
			cubeTextureLoader: new THREE.CubeTextureLoader(loadingManager),
		};
	}

	startLoading() {
		for (const src of this.sources) {
			if (src.type === "gltfModel")
				this.loaders!.gltfLoader.load(src.path!, (gltf: GLTF) => {
					this.sourceLoaded(src, gltf);
				});
			else if (src.type === "texture")
				this.loaders!.textureLoader.load(
					src.path!,
					(texture: THREE.Texture) => {
						this.sourceLoaded(src, texture);
					}
				);
			else if (src.type === "cubeTexture")
				this.loaders!.cubeTextureLoader.load(
					src.paths!,
					(texture: THREE.CubeTexture) => {
						this.sourceLoaded(src, texture);
					}
				);
		}
	}

	private sourceLoaded(
		source: Source,
		file: GLTF | THREE.Texture | THREE.CubeTexture
	) {
		this.items[source.name] = file;
		this.loaded++;

		if (this.loaded === this.toLoad) {
			/**
			 * Emit the ready event when all the files are loaded
			 */
			this.trigger("ready");
		}
	}
}
