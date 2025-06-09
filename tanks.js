class Tank {
    constructor(id, name, nation, tier, type, stats) {
        this.id = id;
        this.name = name;
        this.nation = nation;
        this.tier = tier;
        this.type = type; // 'light', 'medium', 'heavy', 'td', 'spg'
        this.stats = stats; // { hp, damage, penetration, speed, reloadTime }
        this.modules = [];
        this.upgrades = [];
    }

    getDps() {
        return this.stats.damage / (this.stats.reloadTime / 60); // Damage per second
    }
}

const TankData = {
    // USA
    t1_cunningham: {
        name: "T1 Cunningham",
        nation: "usa",
        tier: 1,
        type: "light",
        stats: {
            hp: 120,
            damage: 15,
            penetration: 38,
            speed: 32,
            reloadTime: 90 // frames (1.5 seconds at 60fps)
        }
    },
    m2_light: {
        name: "M2 Light",
        nation: "usa",
        tier: 2,
        type: "light",
        stats: {
            hp: 150,
            damage: 20,
            penetration: 42,
            speed: 36,
            reloadTime: 85
        }
    },
    
    // Germany
    pz_1c: {
        name: "Pz.Kpfw. I C",
        nation: "germany",
        tier: 3,
        type: "light",
        stats: {
            hp: 180,
            damage: 18,
            penetration: 45,
            speed: 40,
            reloadTime: 70
        }
    },
    
    // USSR
    ms_1: {
        name: "MS-1",
        nation: "ussr",
        tier: 1,
        type: "light",
        stats: {
            hp: 110,
            damage: 17,
            penetration: 36,
            speed: 28,
            reloadTime: 95
        }
    },
    bt_2: {
        name: "BT-2",
        nation: "ussr",
        tier: 2,
        type: "light",
        stats: {
            hp: 140,
            damage: 22,
            penetration: 40,
            speed: 42,
            reloadTime: 80
        }
    }
};

const Tanks = {
    createTank: function(tankId) {
        const data = TankData[tankId];
        if (!data) throw new Error(`Unknown tank ID: ${tankId}`);
        return new Tank(tankId, data.name, data.nation, data.tier, data.type, {...data.stats});
    },
    
    getTanksByNation: function(nation) {
        return Object.values(TankData).filter(t => t.nation === nation);
    },
    
    getTanksByTier: function(tier) {
        return Object.values(TankData).filter(t => t.tier === tier);
    }
};
