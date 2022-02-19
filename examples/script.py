import bpy
import json

with open('example.json') as f: 
    j = json.load(f) 
    for z in range(16):
        for y in range(16):
            for x in range(16):
                if j[z][y][x]["visible"] == True:
                    bpy.ops.mesh.primitive_cube_add(location=(x, y, z), scale=(0.5,0.5,0.5))

item='MESH'
bpy.ops.object.select_all(action='DESELECT')
bpy.ops.object.select_by_type(type=item)
bpy.ops.object.join()
