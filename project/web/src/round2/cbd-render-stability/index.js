/** Isolated diagnostic controls. Log/reversed depth and fixed shadows are opt-in,
 * not a declaration that browser temporal stability has been verified. */
export function readCbdRenderStability(search=''){
 const q=search instanceof URLSearchParams?search:new URLSearchParams(search);
 const depth=['standard','logarithmic','reversed'].includes(q.get('depth'))?q.get('depth'):'standard';
 const shadows=['dynamic','off','fixed'].includes(q.get('shadows'))?q.get('shadows'):'dynamic';
 return Object.freeze({depth,shadows,treeLodHysteresis:q.get('treeLod')==='baseline'?0:.12,roofSurfaceOwnership:q.get('roofs')!=='baseline',roadSurfaceOwnership:q.get('roads')!=='baseline',plazaSurfaceOwnership:q.get('plaza')!=='baseline',experimentalDepth:depth!=='standard',browserTemporalAcceptance:false});
}
export function cbdRendererDepthOptions(config){
 return {logarithmicDepthBuffer:config.depth==='logarithmic',reversedDepthBuffer:config.depth==='reversed'};
}
export function cbdShadowRange(distance,config){
 return config.shadows==='fixed'?1350:Math.min(1350,Math.max(100,distance*.68));
}
export function cbdRenderStabilityReport(renderer,camera,config){
 const gl=renderer.getContext(),cap=renderer.capabilities,activeDepth=cap.reversedDepthBuffer?'reversed':cap.logarithmicDepthBuffer?'logarithmic':'standard';
 return {requested:config,activeDepth,
  requestedDepthSupported:activeDepth===config.depth,
  depthBits:gl.getParameter(gl.DEPTH_BITS),sampleBuffers:gl.getParameter(gl.SAMPLE_BUFFERS),samples:gl.getParameter(gl.SAMPLES),
  contextAttributes:gl.getContextAttributes(),drawingBuffer:[gl.drawingBufferWidth,gl.drawingBufferHeight],
  cameraNear:camera.near,cameraFar:camera.far,shadowEnabled:renderer.shadowMap.enabled,
  limit:'CPU LOD boundary tests passed; live shader compilation, temporal pixels and GPU cost must be checked on a WebGL-enabled browser.'};
}
