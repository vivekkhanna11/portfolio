# Urban Mobility, Spatial Analytics and BIM Portfolio

An interactive, browser-based portfolio built using a custom visual node engine (`Portfolio.gh`, inspired by Grasshopper and parametric workflows). This platform showcases urban planning case studies, 3D spatial tools, and data-driven research across the Greater Toronto Area (GTA).

 **Live Interactive Site:** (https://vivekkhanna11.github.io/portfolio/)

---

##  Featured Projects & Case Studies

### 1. Toronto Traffic Analysis
A comprehensive urban mobility study focusing on traffic flow patterns, corridor bottlenecks, and transit-oriented infrastructure within Toronto.
* **Key Focus Areas:**
  * Arterial road network congestion modeling and multi-modal transit connectivity.
  * Pedestrian safety barriers, active transportation corridors, and first/last-mile transit gaps.
  * Spatial analysis of major Toronto thoroughfares (including Finch Ave E and Warden Ave corridors).
* **Technical Methodology:**
  * Integrates spatial GIS datasets, demographic density metrics, and traffic volume projections to evaluate infrastructure disconnects and propose urban mobility enhancements.

### 2. Toronto Interactive
A dynamic, web-based spatial visualization tool designed to display interactive urban data and 3D environment models directly in the browser.
* **Key Features:**
  * WebGL-powered 3D visualization of urban site models and zoning geometries.
  * Real-time spatial metrics, land-use distribution overlays, and building height evaluations.
  * Interactive camera orbits and layer toggling for public engagement and planning reviews.
* **Technical Methodology:**
  * Leverages client-side JavaScript, WebGL, and Three.js to stream and render lightweight spatial geometries without backend database dependencies.
  
### 3. 3D Parametric Kitchen Layout Editor
A spatial configuration tool that allows users to design, manipulate, and evaluate modular kitchen layouts in 3D.
* **Key Features:**
  * Drag-and-drop or grid-snapping placement of cabinetry, appliances, and countertops.
  * Parametric dimension adjustments (width, depth, height) for custom joinery.
  * Live clearance check indicators for ergonomic kitchen work triangles (sink, stove, refrigerator).
* **Technical Methodology:**
  * Built using **Three.js** with raycasting for object selection, surface snapping, and boundary collision detection.
  * Modifying sliders updates object transformation matrices dynamically while maintaining spatial constraint rules.
---

##  Interactive Interface & Web Tools (`Portfolio.gh`)

The site features a custom **parametric node canvas** that mimics parametric design environments:
* **Interactive Navigation:** Drag canvas to pan, scroll to zoom, and select nodes to inspect project inputs, analytical methodologies, and output visualizations.
* **AEC & Planning Suite:** Includes interactive modules for:
  * **3D WebGL BIM / IFC Viewer:** Browser-based property set inspection and storey sectioning.
  * **PDF Digital Quantity Takeoff (QTO) Engine:** Real-time scale calibration and area/linear measurements on drawing sets.
  * **3D Parametric Kitchen Layout Editor:** Real-time spatial constraint checking and ergonomic clearance validation.
  * **Embodied Carbon Calculator:** Sustainability benchmarking for building materials.

---

## Tech Stack & Architecture

* **Frontend & Graphics:** HTML5, CSS3, ES6+ JavaScript, WebGL, Three.js
* **Spatial & Analytical Frameworks:** WebGIS principles, Parametric Node Execution (`Portfolio.gh`)
* **Hosting & Deployment:** GitHub Pages
