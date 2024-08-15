import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader"
import * as THREE from "three"
export function mesh_from_group(group, name, color) {
	const oldmesh = group.children[0]
	const mesh = new THREE.Mesh(oldmesh.geometry, getStandardMetallicMaterial(color))
	mesh.name = name
	return mesh
}
export function getStandardMetallicMaterial(color) {
	const material = new THREE.MeshStandardMaterial({ color: color })
	material.metalness = 0.9
	material.roughness = 0.8
	return material
}
export function getStandardMatteMaterial(color) {
	const material = new THREE.MeshStandardMaterial({ color: color })
	material.metalness = 0.01
	material.roughness = 0.99
	return material
}
export async function load_all_objs(mesh_paths, mesh_keys) {
	const loader = new OBJLoader()
	const mesh_paths_lst = Object.values(mesh_paths)
	const mesh_promises = mesh_paths_lst.map(mesh_path => loader.loadAsync(mesh_path))
	const meshes_lst = await Promise.all(mesh_promises)
	const meshes_obj = {}
	for (let i = 0; i < mesh_keys.length; i++) {
		meshes_obj[mesh_keys[i]] = meshes_lst[i]
	}
	return meshes_obj
}
export async function get_meshes_dict(mesh_paths, mesh_keys, color) {
	const meshes = {}
	const groups = await load_all_objs(mesh_paths, mesh_keys)
	for (let i = 0; i < (mesh_keys.length); ++i) {
		meshes[mesh_keys[i]] = mesh_from_group(groups[mesh_keys[i]], mesh_keys[i], color)
	}
	return meshes
}
