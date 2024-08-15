import Mesh from "./mesh.js";
import { Material, MaterialLibrary } from "./material.js";
import { Layout, TYPES, DuplicateAttributeException, Attribute } from "./layout.js";
import { downloadModels, downloadMeshes, initMeshBuffers, deleteMeshBuffers, } from "./utils.js";
const version = "2.0.3";
export const OBJ = {
    Attribute,
    DuplicateAttributeException,
    Layout,
    Material,
    MaterialLibrary,
    Mesh,
    TYPES,
    downloadModels,
    downloadMeshes,
    initMeshBuffers,
    deleteMeshBuffers,
    version,
};
/**
 * @namespace
 */
export { Attribute, DuplicateAttributeException, Layout, Material, MaterialLibrary, Mesh, TYPES, downloadModels, downloadMeshes, initMeshBuffers, deleteMeshBuffers, version, };
