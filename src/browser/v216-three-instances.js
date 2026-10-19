// Numeric InstancedMesh subset adapted from Anime.js 4.5.0's MIT three/instance.js.
// Flat getters/setters use Anime's ordinary object tween path. No private registry,
// material/TSL/BatchedMesh adapter, second engine or independent render loop is used.
function initV216Instances(){
 if(!window.THREE)return;
 const {Matrix4,Vector3,Quaternion}=window.THREE,bindings=new WeakMap();
 function binding(mesh){
  if(bindings.has(mesh))return bindings.get(mesh);
  const b={mesh,instances:[],dirty:[],user:mesh.onBeforeRender,flush(){
   if(!this.dirty.length)return;
   for(const item of this.dirty){item.matrix.compose(item.position,item.rotation,item.scale);mesh.setMatrixAt(item.id,item.matrix);item.dirty=false;}
   mesh.instanceMatrix.needsUpdate=true;this.dirty.length=0;
  }};
  Object.defineProperty(mesh,'onBeforeRender',{configurable:true,get:()=>function(...args){b.flush();b.user?.apply(mesh,args);},set:fn=>{b.user=fn;}});
  bindings.set(mesh,b);return b;
 }
 class Instance{
  constructor(b,id){this.binding=b;this.id=id;this.matrix=new Matrix4();this.position=new Vector3();this.rotation=new Quaternion();this.scale=new Vector3();this.dirty=false;b.mesh.getMatrixAt(id,this.matrix);this.matrix.decompose(this.position,this.rotation,this.scale);}
  mark(){if(!this.dirty){this.dirty=true;this.binding.dirty.push(this);}}
 }
 for(const [name,vector,axis]of [['x','position','x'],['y','position','y'],['z','position','z'],['scaleX','scale','x'],['scaleY','scale','y'],['scaleZ','scale','z']])Object.defineProperty(Instance.prototype,name,{get(){return this[vector][axis];},set(value){this[vector][axis]=value;this.mark();}});
 function getInstances(mesh){const b=binding(mesh);for(let i=b.instances.length;i<mesh.count;i++)b.instances.push(new Instance(b,i));b.instances.length=mesh.count;return b.instances;}
 window.NERV_THREE_INSTANCES={getInstances,commitChanges:mesh=>bindings.get(mesh)?.flush(),source:'Anime.js 4.5.0 numeric instance subset'};
}
initV216Instances();
