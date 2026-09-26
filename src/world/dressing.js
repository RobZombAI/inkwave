// Set dressing per stage: PropKit placements (see src/world/props.js). Everything listed for team 0's half is mirrored
// by the map's 180° rotation (x,z → -x,-z, rotY + π) exactly like the level blocks, so both sides stay identical.
// Only `mirror: false` items are placed once.
import { HALYARD_VESSELS } from './props-marina-vessels.js';

const P = Math.PI;

export const DRESSING = {
  tidewater: [
    // plaza furniture along the sea wall
    { type: 'bench', pos: [-23.2, 0, -26], rotY: P / 2 },
    { type: 'bench', pos: [-23.2, 0, 26], rotY: P / 2 },
    { type: 'trashbin', pos: [-23.4, 0, -23.6] },
    { type: 'bollard', pos: [-24.7, 1.05, -12] }, { type: 'bollard', pos: [-24.7, 1.05, -2] },
    { type: 'lifering', pos: [-24.6, 1.05, 18] },
    // kiosk dressing (right base): awning + vending + sign
    { type: 'awning', pos: [17.35, 2.7, -37.5], rotY: -P / 2, width: 4.2 },
    { type: 'vending', pos: [16.6, 0, -34.2], rotY: -P / 2, variant: 0 },
    { type: 'vending', pos: [16.6, 0, -35.4], rotY: -P / 2, variant: 1 },
    { type: 'sign', pos: [19.8, 3.2, -35.2], rotY: 0, width: 3.2, height: 1.1, variant: 1 },
    { type: 'acunit', pos: [22.1, 1.8, -38.5], rotY: P / 2 },
    // spawn deck
    { type: 'banner', pos: [-9.4, 2.2, -36.5], team: 0 },
    { type: 'banner', pos: [9.4, 2.2, -36.5], team: 0 },
    { type: 'speaker', pos: [-7.8, 2.2, -42.6], rotY: 0.3 },
    { type: 'speaker', pos: [7.8, 2.2, -42.6], rotY: -0.3 },
    { type: 'bunting', pos: [-9, 5.2, -43.2], rotY: 0, length: 18, team: 0 },
    // container yard corner
    { type: 'pipes', pos: [-19.75, 0.6, -32.5], rotY: P / 2, length: 4.5 },
    { type: 'barrel', pos: [-23.2, 0, -35.6] }, { type: 'barrel', pos: [-22.6, 0, -36.4], variant: 1 },
    { type: 'pallet', pos: [-23.3, 0, -38.2], rotY: 0.2 },
    { type: 'tires', pos: [-17.2, 0, -37.8] },
    // mid
    { type: 'cone', pos: [-8.2, 0, -12.4] }, { type: 'cone', pos: [-7.4, 0, -12.1] },
    { type: 'planter', pos: [13.5, 0, -8], variant: 1 },
    { type: 'lightpole', pos: [-24.1, 1.05, -8], rotY: P / 2 },
    { type: 'neon', pos: [0, 2.6, -43.35], rotY: 0, width: 4, variant: 0, mirror: true },
    // ---- street-level detail pass (stream 5): walls, overhead, dead ends, spawn-deck corners
    // back wall (face z = -43.4): cable tray, posters, fuse box, hose reel; a cluttered dead-end alley behind the left ramp
    { type: 'cable', pos: [-24.6, 0, -43.4], variant: 1, length: 15.2, height: 3.35 },
    { type: 'poster', pos: [-21.4, 1.45, -43.4], count: 4, variant: 0 },
    { type: 'poster', pos: [-12.4, 1.35, -43.4], count: 2, variant: 7 },
    { type: 'cabinet', pos: [-24.25, 1.75, -43.4], variant: 1 },
    { type: 'hosereel', pos: [-17.6, 1.15, -43.4] },
    { type: 'bikerack', pos: [-22.9, 0, -42.2], count: 3, bikes: 2 },
    { type: 'gascage', pos: [-14.4, 0, -42.72] },
    { type: 'crates', pos: [-11.9, 0, -42.75], variant: 2, rotY: 0.1 },
    { type: 'barrel', pos: [-10.1, 0, -42.8], color: 'mustard' },
    { type: 'streetsign', pos: [-9.8, 1.7, -43.4], variant: 2, wall: true },
    // left yard: wayfinding + scooter by the container corner, stickers on the container
    { type: 'fingerpost', pos: [-19.2, 0, -34.3], variant: 1, count: 3 },
    { type: 'scooter', pos: [-18.4, 0, -42.7], rotY: 0.05, variant: 1 },
    { type: 'stickers', pos: [-19.8, 1.2, -32.2], rotY: P / 2, count: 9, width: 1.2, height: 1.2 },
    // spawn deck corners (outside the barrier) + parapet backs
    { type: 'cooler', pos: [-6.3, 2.2, -42.85], rotY: 0.25 },
    { type: 'deckchair', pos: [-5.5, 2.2, -41.7], rotY: 0.5 },
    { type: 'stickers', pos: [-7.6, 2.6, -35.6], rotY: P, count: 6, width: 2.0, height: 0.45 },
    { type: 'stringlights', pos: [-8.6, 3.0, -35.3], length: 17.2, height: 2.7, sag: 0.75, posts: true },
    // kiosk: back-face posters (seen from the deck), ferry times on the front, ice chest in the alley behind it
    { type: 'poster', pos: [19.6, 1.55, -40], rotY: P, count: 3, variant: 5 },
    { type: 'ferryboard', pos: [20.2, 1.6, -35], wall: true },
    { type: 'stickers', pos: [18.2, 1.0, -35], count: 7, width: 0.9, height: 1.2 },
    { type: 'cooler', pos: [21.4, 0, -43.0], variant: 1 },
    // boardwalk (railing side only): festoon lights lamp to lamp, bikes along the railing, fishing gear at the notch
    { type: 'stringlights', pos: [-23.5, 0, -42], rotY: -P / 2, length: 22, height: 4.45, sag: 0.9 },
    { type: 'bike', pos: [-24.0, 0, -12.5], rotY: -P / 2 + 0.05 },
    { type: 'bike', pos: [-23.95, 0, -10.6], rotY: -P / 2 - 0.08, variant: 1 },
    { type: 'newsbox', pos: [-23.9, 0, -24.4], rotY: P / 2, variant: 0 },
    { type: 'net', pos: [-24.15, 0, -1.2], rotY: -P / 2, length: 2.6 },
    { type: 'crabtrap', pos: [-23.8, 0, 2.6], rotY: P / 2, variant: 1 },
    { type: 'ropecoil', pos: [-23.75, 0, 4.75], variant: 0 },
    { type: 'streetsign', pos: [-24.7, 1.05, 5.4], variant: 3, size: 0.5, height: 1.0 },
    // central tower + mid walls: posters, signs, stickers (wall-flush, no colliders)
    { type: 'poster', pos: [-2.7, 1.45, -5], rotY: P, count: 3, variant: 8 },
    { type: 'streetsign', pos: [-5, 1.85, -3.1], rotY: -P / 2, variant: 6, wall: true },
    { type: 'stickers', pos: [-5, 0.9, -1.6], rotY: -P / 2, count: 8, width: 1.6, height: 0.8 },
    { type: 'poster', pos: [-9.2, 1.45, -20.6], rotY: P / 2, count: 3, variant: 1 },
    { type: 'poster', pos: [-10.2, 1.45, -15.4], rotY: -P / 2, count: 2, variant: 6 },
    { type: 'poster', pos: [11.3, 1.3, -2.2], rotY: P, count: 2, variant: 2 },
    { type: 'stickers', pos: [-14.8, 0.45, -19.4], count: 7, width: 3.6, height: 0.5 },
    { type: 'skateboard', pos: [-13.3, 0, -19.05], variant: 1 },
    { type: 'stickers', pos: [5.8, 1.1, -23.8], count: 5, width: 2.4, height: 1.8 },
    // more wall-flush detail (zero gameplay footprint)
    { type: 'poster', pos: [-14, 0.84, 3.4], rotY: P / 2, count: 2, variant: 9 },
    { type: 'stickers', pos: [-14, 0.8, 0.4], rotY: P / 2, count: 6, width: 1.6, height: 0.9 },
    { type: 'stickers', pos: [-21, 1.25, -27], count: 7, width: 1.8, height: 1.5 },
    { type: 'cabinet', pos: [14, 0.72, -26.8], rotY: -P / 2, variant: 1 },
    { type: 'stickers', pos: [14, 0.6, -24.2], rotY: -P / 2, count: 6, width: 2.4, height: 0.7 },
    { type: 'stickers', pos: [-6.5, 0.7, -27.8], rotY: P, count: 5, width: 1.2, height: 1.1 },
    { type: 'streetsign', pos: [9.5, 1.72, -1.7], rotY: -P / 2, variant: 7, wall: true },
    { type: 'hydrant', pos: [9.5, 0.75, -1.7], rotY: -P / 2, variant: 1 },
  ],
  halyard: [
    // owner: docks stream (src/world/props-marina-dock.js). Alpha half; every entry is mirrored (x,z → -x,-z).
    // ---- pier edges: `pieredge` runs start on the deck edge and run along local +X with the water on local +Z.
    //      Concave corners: one run keeps its whaler to the corner (ext 0, first pile 0.75 in), the other butts into it
    //      (ext -0.1); convex corners: one run wraps the corner (ext 0.1). Jump edges carry nothing on the deck.
    // quay front (basin)
    { type: 'pieredge', pos: [-19.5, 0, -31], rotY: 0, length: 15, s0: 0.75, s1: 0.75, cleats: [3.2, 8.6], fenders: [1.9, 5.3, 12] },
    { type: 'pieredge', pos: [4.5, 0, -31], rotY: 0, length: 5.5, s0: 0.75, s1: 0.75 },
    // fuel dock: west side (fuel berth, D-fender), east side (jump edge x = 4.5), mid end (gangway)
    { type: 'pieredge', pos: [-4.5, 0, -31], rotY: -P / 2, length: 18.6, ext0: -0.1, ext1: -0.1, dfender: true, cleats: [4.2, 9.4, 14.6], ladders: [2.2] },
    { type: 'pieredge', pos: [-4.5, 0, -10.4], rotY: -P / 2, length: 1.8, ext0: -0.1, dfender: true },
    { type: 'pieredge', pos: [4.5, 0, -26], rotY: P / 2, length: 5, ext0: -0.1, ext1: -0.1, dfender: true },
    { type: 'pieredge', pos: [4.5, 0, -8.6], rotY: P / 2, length: 15.4, ext1: -0.1, dfender: true },
    { type: 'pieredge', pos: [-4.5, 0, -8.6], rotY: 0, length: 9, ext0: 0.1, ext1: 0.1, skip: [[2.5, 6.5]], dfender: true },
    // long pier inner side (houseboat berth), finger pier, boardwalk
    { type: 'pieredge', pos: [-19.5, 0, -26.4], rotY: P / 2, length: 4.6, ext0: -0.1, ext1: -0.1 },
    { type: 'pieredge', pos: [-19.5, 0, -12.4], rotY: P / 2, length: 12.8, ext0: -0.1, ext1: -0.1, skip: [[5.4, 7.4]], cleats: [2.4, 10.4], fenders: [3.9, 9.2] },
    { type: 'pieredge', pos: [-19.5, 0, 0], rotY: P / 2, length: 10.4, ext1: -0.1 },
    { type: 'pieredge', pos: [-19.5, 0, -25.2], rotY: 0, length: 7, s0: 0.75, ext1: 0.1, cleats: [2.6, 5.9], fenders: [1.6, 4.3] },
    { type: 'pieredge', pos: [-12.5, 0, -26.4], rotY: P, length: 7, ext0: 0.1, s1: 0.75, cleats: [1.1, 4.4], fenders: [2.7, 5.4], ladders: [6.1] },
    { type: 'pieredge', pos: [-12.5, 0, -25.2], rotY: P / 2, length: 1.2 },
    { type: 'pieredge', pos: [-19.5, 0, -10.4], rotY: 0, length: 15, s0: 0.75, s1: 0.75, cleats: [4.1, 10.9] },
    { type: 'pieredge', pos: [-4.5, 0, -12.4], rotY: P, length: 15, s0: 0.75, s1: 0.75, cleats: [4.1, 10.9], fenders: [7.5] },
    // boatyard: west side (jump edge z -24…-8.6), north end, strip (jump edge to the ferry, plank landing)
    { type: 'pieredge', pos: [10, 0, -31], rotY: -P / 2, length: 5, ext0: -0.1, ext1: -0.1 },
    { type: 'pieredge', pos: [10, 0, -24], rotY: -P / 2, length: 17, ext0: -0.1 },
    { type: 'pieredge', pos: [10, 0, -7], rotY: 0, length: 9.5, ext0: 0.1, s1: 0.75, cleats: [2.2] },
    { type: 'pieredge', pos: [19.5, 0, -7], rotY: -P / 2, length: 7, ext0: -0.1, skip: [[1.9, 4.6]] },
    // walkway fuel dock ↔ yard
    { type: 'pieredge', pos: [4.5, 0, -24], rotY: 0, length: 5.5, s0: 0.75, s1: 0.75 },
    { type: 'pieredge', pos: [10, 0, -26], rotY: P, length: 5.5, s0: 0.75, s1: 0.75 },
    // arena perimeter (outer edges): tall capped piles
    { type: 'pieredge', pos: [-24, 0, -51.95], rotY: -P / 2, length: 51.95, outer: true, cleats: [10.5, 27.5, 43.5] },
    { type: 'pieredge', pos: [24, 0, 0], rotY: P / 2, length: 51.95, outer: true, spacing: 4.0, cleats: [8.5, 24.5, 30.0] },   // 4.0: vessels' marina gangway (z -37.9) sits between the piles at z -35.85 / -39.8
    { type: 'pieredge', pos: [24, 0, -51.95], rotY: P, length: 48, outer: true, ext0: 0.1, ext1: 0.1, spacing: 6.0, wraps: false },
    // ---- clubhouse (facade fittings on the back wall + upper storey / roofs / cupola / flagstaff behind it, collides)
    { type: 'clubhouse', pos: [0, 0, -45.4], rotY: 0 },
    // terrace: planters with little trees at the back corners (outside the 4.2 m spawn circle)
    { type: 'planter', pos: [-6.4, 2.4, -44.72], rotY: 0, variant: 2, color: 'tealdark' },
    { type: 'planter', pos: [6.4, 2.4, -44.72], rotY: 0, variant: 2, color: 'tealdark' },
    // ---- quay: boathouse + harbour office dressing, café terrace, benches, bins, bikes, kayaks, site map
    { type: 'boathouse', pos: [18.5, 0, -43.0], rotY: 0 },
    { type: 'harbouroffice', pos: [-19.8, 0, -42.9], rotY: 0 },
    { type: 'cafeset', pos: [-15.35, 0, -43.55], rotY: 0.3, variant: 0 },
    { type: 'cafeset', pos: [-14.0, 0, -41.7], rotY: 0.9, variant: 1 },
    { type: 'aboard', pos: [-11.75, 0, -44.75], rotY: 0.25 },
    { type: 'planter', pos: [-10.0, 0, -44.95], rotY: 0, length: 1.2, width: 0.6, variant: 1, color: 'tealdark' },
    { type: 'bench', pos: [-15.4, 0, -31.75], rotY: 0 },
    { type: 'bench', pos: [-8.9, 0, -31.75], rotY: 0 },
    { type: 'bench', pos: [7.6, 0, -31.75], rotY: 0 },
    { type: 'trashbin', pos: [-13.95, 0, -31.95] },
    { type: 'trashbin', pos: [9.05, 0, -32.0] },
    { type: 'bikerack', pos: [10.85, 0, -44.55], count: 2, bikes: 0 },
    { type: 'scooter', pos: [12.05, 0, -44.7], rotY: 0.12, variant: 0 },
    { type: 'kayakrack', pos: [23.25, 0, -43.0], rotY: P / 2 },
    { type: 'surfrack', pos: [14.18, 0, -42.1], rotY: -P / 2, variant: 1 },
    { type: 'mapboard', pos: [-23.35, 0, -34.2], rotY: P / 2 },
    // ---- dock hardware: shore power at the berths, bollard lights + life rings on the edges, mooring bitts
    { type: 'shorepower', pos: [-19.88, 0, -22.3], rotY: P / 2, berth: 'H1' },
    { type: 'shorepower', pos: [-17.2, 0, -31.38], rotY: 0, berth: 'Q4' },
    { type: 'bollardlight', pos: [-23.72, 0, -27.0] },
    { type: 'bollardlight', pos: [-23.72, 0, -13.0] },
    { type: 'bollardlight', pos: [23.72, 0, -27.5] },
    { type: 'bollardlight', pos: [23.72, 0, -15.5] },
    { type: 'bollardlight', pos: [-4.15, 0, -26.0] },
    { type: 'lifering', pos: [-23.6, 0, -21.0], rotY: P / 2 },
    { type: 'bollard', pos: [-23.55, 0, -38.0], variant: 2 },
    { type: 'bollard', pos: [23.55, 0, -34.0], variant: 2 },
    // ---- boatyard: travel lift over the yard entrance (legs collide, beams ≥ 5.4 m), workbench + washer between its
    //      west legs at the water's edge, laid-up launch under a tarp at the yard edge, scaffold at the tug's bow beside
    //      (not on) the ramp, drums by the tug's stern (the tug's own stands, cribbing and ladder come from vessels)
    { type: 'travellift', pos: [13.6, 0, -29.0], rotY: 0 },
    { type: 'tarpboat', pos: [23.2, 0, -11.4], rotY: P / 2 },
    { type: 'scaffold', pos: [19.66, 0, -12.36], rotY: 0 },
    { type: 'workbench', pos: [10.45, 0, -29.45], rotY: P / 2, washerSide: -1 },
    { type: 'barrel', pos: [21.1, 0, -23.25], rotY: P / 2, variant: 1, color: '#3f6fb0', color2: '#c9453b' },
    // ---- ramps (non-colliding dressing outside the walking widths): grand stair balustrade, fuel-dock gangway rails,
    //      houseboat gangway rails
    { type: 'grandstair', pos: [0, 0, -32.4], rotY: P, run: 6.1, rise: 2.4, width: 6 },
    { type: 'gangwayrails', pos: [0, 0, -8.8], rotY: 0, run: 3.85, rise: 1.3, width: 3.4, thick: 0.22, posts: 5 },
    { type: 'gangwayrails', pos: [-19.7, 0, -18.8], rotY: P / 2, run: 2.35, rise: 0.7, width: 1.6, thick: 0.18, posts: 3 },
    // ---- harbour beacon crown (the beacon block straddles the lane seam; the mirror copy dresses the far one)
    { type: 'beacon', pos: [-22.6, 0, 0], rotY: 0 },
    // ---- outside the arena: breakwater arm with a green pier-head light, channel markers
    { type: 'breakwater', pos: [42, 0, -62], rotY: 0, length: 72 },
    { type: 'channelmarker', pos: [37.0, -1.6, 21.5], variant: 0 },
    { type: 'channelmarker', pos: [31.0, -1.6, 17.0], variant: 1 },
    // ---- required cover (gameplay footprints from docs/HALYARD.md — colliders are exact)
    { type: 'fuelpump', pos: [3.5, 0, -13.8], rotY: 0, price: '1.89' },
    { type: 'fuelpump', pos: [-3.5, 0, -13.8], rotY: P, price: '1.89' },
    { type: 'dockbox', pos: [-23.1, 0, -7.5], rotY: P / 2 },
    { type: 'pumpout', pos: [-22.7, 0, -19.0], rotY: P / 2 },
    { type: 'keelblocks', pos: [11.9, 0, -10.8], rotY: 0 },
    { type: 'quaycrates', pos: [-11.7, 0, -34.4], rotY: 0, variant: 0 },
    { type: 'quaycrates', pos: [11.5, 0, -35.6], rotY: 0, variant: 1 },
    // ---- fuel dock: hut kit (roof sign + roof kit collide), ice chest + bait cooler, landmark sign, life ring
    { type: 'fuelhut', pos: [0, 0, -20.65], rotY: 0 },
    { type: 'cooler', pos: [-0.85, 0, -22.9], rotY: P, variant: 1 },
    { type: 'cooler', pos: [-0.55, 0.94, -22.85], rotY: P + 0.18, variant: 0, color: 'teal' },
    { type: 'fueldocksign', pos: [-4.2, 0, -9.3], rotY: 0 },
    { type: 'lifering', pos: [-4.12, 0, -16.6], rotY: P / 2 },
  ],
  kelpline: [
    // gantry deck: railings on its steel (un-inkable) sides
    { type: 'railing', pos: [-6.9, 2.8, -6.6], rotY: -P / 2, length: 13.2, mirror: false },
    { type: 'railing', pos: [6.9, 2.8, 6.6], rotY: P / 2, length: 13.2, mirror: false },
    // container ends + pipes on the base containers
    { type: 'container_door', pos: [-18.8, 0, -36.02], rotY: P },
    { type: 'container_door', pos: [15.05, 0, -33.02], rotY: P },
    { type: 'pipes', pos: [-17.55, 0.5, -34], rotY: P / 2, length: 3.2 },
    // sea edge
    { type: 'bollard', pos: [-23.7, 1.05, -30] }, { type: 'bollard', pos: [-23.7, 1.05, -38] },
    { type: 'lifering', pos: [-23.6, 1.05, -26] },
    { type: 'lightpole', pos: [-23.8, 2.95, -15.2], rotY: P / 2 },
    // raised side deck
    { type: 'bench', pos: [-22.9, 2.0, -19.5], rotY: P / 2 },
    { type: 'acunit', pos: [-15.1, 1.0, -18.5], rotY: P / 2 },
    // trench ends
    { type: 'barrier', pos: [-21.5, 0, -4.2], rotY: 0, color: '#e8a33a' },
    { type: 'barrier', pos: [-19.3, 0, -4.2], rotY: 0, color: '#f2f0ea' },
    // spawn deck
    { type: 'banner', pos: [-9.4, 3.2, -40.5], team: 0 },
    { type: 'banner', pos: [9.4, 3.2, -40.5], team: 0 },
    { type: 'vending', pos: [-6.5, 3.2, -46.8], rotY: 0 },
    { type: 'speaker', pos: [6.8, 3.2, -46.6], rotY: -0.2 },
    { type: 'bunting', pos: [-10, 6.2, -47.2], rotY: 0, length: 20, team: 0 },
    // yard clutter in corners (out of the main lanes)
    { type: 'barrel', pos: [-22.8, 0, -44.8] }, { type: 'barrel', pos: [-22.1, 0, -45.6], variant: 1 },
    { type: 'pallet', pos: [-20.6, 0, -46.2], rotY: 0.3 },
    { type: 'tires', pos: [22.3, 0, -46] },
    { type: 'crates', pos: [21.8, 0, -27.5], variant: 1 },
    { type: 'cone', pos: [6.8, 0, -15.2] }, { type: 'cone', pos: [7.6, 0, -15.6] },
    { type: 'sign', pos: [-2, 4.2, -47.3], rotY: 0, width: 4.2, height: 1.2, variant: 0 },
    { type: 'neon', pos: [11, 1.9, -47.35], rotY: 0, width: 3.2, variant: 1 },
    // ---- street-level detail pass (stream 5)
    // back wall (face z = -47.4): cable tray, posters, hose reel, fuse box; dead-end alley behind the left ramp
    { type: 'cable', pos: [-23.6, 0, -47.4], variant: 1, length: 13.2, height: 3.9 },
    { type: 'poster', pos: [-15.6, 1.5, -47.4], count: 4, variant: 3 },
    { type: 'hosereel', pos: [-21.7, 1.15, -47.4] },
    { type: 'cabinet', pos: [-11.2, 1.8, -47.4], variant: 1 },
    { type: 'gascage', pos: [-12.7, 0, -46.75] },
    { type: 'palletjack', pos: [-15.4, 0, -46.6], rotY: 0.1 },
    { type: 'sandbags', pos: [-23.15, 0, -42.4], rotY: P / 2, length: 3, height: 2 },
    // spawn deck: festoon lights on the parapets, parapet stickers, a cooler in the back corner
    { type: 'stringlights', pos: [-9.6, 4.0, -40.3], length: 19.2, height: 2.45, sag: 0.8, posts: true },
    { type: 'stickers', pos: [-8.5, 3.6, -40.6], rotY: P, count: 5, width: 2.2, height: 0.5 },
    { type: 'cooler', pos: [-9.3, 3.2, -46.95], rotY: 0.2 },
    // base yard: stickers on the containers, wayfinding, a bike by the railing
    { type: 'stickers', pos: [-17.6, 1.2, -34.8], rotY: P / 2, count: 8, width: 1.4, height: 1.2 },
    { type: 'stickers', pos: [12, 1.3, -31.8], rotY: -P / 2, count: 7, width: 1.6, height: 1.2 },
    { type: 'fingerpost', pos: [-20.6, 0, -37.1], variant: 4, count: 3 },
    { type: 'bike', pos: [-22.9, 0, -39.4], rotY: -P / 2 + 0.06, variant: 1 },
    { type: 'stringlights', pos: [-23, 0, -40], rotY: -P / 2, length: 15, height: 4.45, sag: 0.7 },
    // mid cover + walls
    { type: 'stickers', pos: [-8.5, 0.5, -20], rotY: P, count: 7, width: 4.4, height: 0.55 },
    { type: 'skateboard', pos: [-7.1, 0, -19.05], variant: 1 },
    { type: 'stickers', pos: [6.5, 0.5, -13.6], rotY: P, count: 6, width: 4.4, height: 0.5 },
    { type: 'poster', pos: [17.5, 1.3, -9], rotY: P, count: 2, variant: 10 },
    { type: 'stickers', pos: [15, 1.2, -18.8], rotY: -P / 2, count: 7, width: 1.8, height: 1.4 },
    { type: 'stickers', pos: [11.44, 1.2, -23], rotY: P / 2, count: 8, width: 3.0, height: 1.4 },
    { type: 'stickers', pos: [-6.0, 1.0, -6.6], rotY: P, count: 6, width: 1.0, height: 1.4 },
    { type: 'poster', pos: [6.0, 1.3, -6.6], rotY: P, variant: 11 },
    // raised side deck: picnic table with parasol by the rail, potted plants, festoon lights on the rail wall
    { type: 'picnic', pos: [-22.2, 2.0, -12.4], rotY: P / 2, variant: 0, color: 'coral' },
    { type: 'pot', pos: [-23.1, 2.0, -21.2], variant: 1 },
    { type: 'stringlights', pos: [-23.8, 2.95, -21.6], rotY: -P / 2, length: 5.8, height: 2.2, sag: 0.35, posts: true },
    // dry-dock trench (wall face z = -3, floor y = -2): cable tray, pipe run, service ladder, warning signs, clutter at the dead end
    { type: 'cable', pos: [-23.2, -2, -3], variant: 1, length: 9.4, height: 1.75 },
    { type: 'pipes', pos: [-6.6, -2, -3], length: 5.4, count: 2, height: 1.4 },
    { type: 'ladder', pos: [-19.6, -2, -3], height: 2.0 },
    { type: 'streetsign', pos: [-17.4, -0.8, -3], wall: true, variant: 3 },
    { type: 'streetsign', pos: [1.4, -0.95, -3], wall: true, variant: 0 },
    { type: 'hosereel', pos: [-21.3, -1.0, -3] },
    { type: 'crates', pos: [-22.4, -2, -2.1], variant: 0, rotY: 0.15 },
    { type: 'barrel', pos: [-22.75, -2, 0.7], color: 'coral' },
    // more wall-flush detail (zero gameplay footprint)
    { type: 'stickers', pos: [-20, 1.2, -33.4], rotY: -P / 2, count: 6, width: 1.8, height: 1.2 },
    { type: 'poster', pos: [-15, 1.0, -12.2], rotY: P / 2, count: 2, variant: 4 },
    { type: 'cabinet', pos: [-15, 0.95, -20.6], rotY: P / 2, variant: 1 },
    { type: 'stickers', pos: [16.3, 0.9, -8], rotY: 0, count: 5, width: 0.6, height: 1.2 },
    { type: 'hosereel', pos: [17.3, 1.1, -30.56], rotY: 0 },
  ],
};

// stage packs that own their own placement lists
const EXTRA = { halyard: HALYARD_VESSELS };

// Expand the half-list into world placements for both halves.
export function dressingFor(layoutId) {
  const src = [...(DRESSING[layoutId] || []), ...(EXTRA[layoutId] || [])];
  const out = [];
  for (const it of src) {
    out.push(it);
    if (it.mirror === false) continue;
    const [x, y, z] = it.pos;
    out.push({ ...it, pos: [-x, y, -z], rotY: (it.rotY || 0) + P, team: it.team === undefined ? undefined : 1 - it.team });
  }
  return out;
}
