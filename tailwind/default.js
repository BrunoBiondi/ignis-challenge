new Vue({
    el: "#app",
    data: () => ({
        champion: null,

        text:
            "Vasco;Rio de Janeiro\n" +
            "Flamengo;Rio de Janeiro\n" +
            "Palmeiras;São Paulo\n" +
            "Santos;São Paulo\n" +
            "Cruzeiro;Minas Gerais\n" +
            "Internacional;Rio Grande do Sul\n",

        list: [],
        rounds: [],

        error: null,
    }),
    methods: {
        prepare(total = 2) {
            this.resetResults();

            // Lista formatada
            const list = this.getTextToList();
            console.log(this.error, list);
            if (!list.length) return;

            console.log("UAI");

            this.list = list;

            // Primeira Rodada
            this.createFirstRound();
            if (total === 1) return;

            // Outras *n rodadas
            for (let i = 1; i < total; i++) {
                this.createNextRound();
            }

            // Campeão do Torneio
            this.champion = this.getChampion();
        },
        resetResults() {
            this.champion = null;
            this.list = [];
            this.rounds = [];
            this.error = null;
        },

        getTextToList() {
            const teams = [];
            const duplicates = [];

            const list = this.text
                .trim()
                .split(/\r?\n/g)
                .filter((v) => v.trim().length)
                .map((v, i) => {
                    const serie = String.fromCharCode(i + 65);
                    const [team, state] = v.toUpperCase().split(";");
                    const photo = `./../img/teams/${team.toLowerCase()}-capa.jpg`;

                    if (teams.includes(team)) {
                        duplicates.push(team);
                    } else {
                        teams.push(team);
                    }

                    return {
                        serie,
                        state,
                        team,
                        photo,
                        points: 0,
                        goals: 0,
                        home: 0,
                        win: false,
                        aTie: false,
                        double: false,
                    };
                });

            if (duplicates.length) {
                this.error = `Times duplicados: ${duplicates.join(", ")}.`;
            } else if (list.length < 4) {
                this.error = "Informe 04 Times ou mais em pares.";
            } else if (list.length % 2 !== 0) {
                this.error = "Acrescente ou remova um Time.";
            }

            return this.error ? [] : list;
        },

        createFirstRound() {
            const divide = Math.ceil(this.list.length / 2); // Meio da Lista
            const list1 = JSON.parse(JSON.stringify(this.list)); // Remove referências do objeto
            const list2 = list1.splice(divide, Number.MAX_VALUE).reverse(); // Remove metade de list1 passando os demais para list2 já ordenados

            const { results } = this.createResults({ list1, list2 });
            this.rounds.push({ list1, list2, results });
        },

        createNextRound() {
            const lastGame = this.rounds.slice(-1)[0];

            const { list1, list2 } = this.rotateTeams(lastGame);
            const { results } = this.createResults({ list1, list2 });

            this.rounds.push({ list1, list2, results });
        },

        rotateTeams(round) {
            // Remove referências do objeto
            const list1 = JSON.parse(JSON.stringify(round.list1));
            const list2 = JSON.parse(JSON.stringify(round.list2));

            list2.push(list1.pop()); // Remove o último time de list1 e passa para list2
            list1.splice(1, 0, list2.shift()); // Remove o primeor time de list2 e passa para list1

            return { list1, list2 };
        },

        createResults({ list1, list2 }) {
            const results = []; // variável final

            const states = [];
            const doubleRound = [];

            for (let i = 0; i < list1.length; i++) {
                const team1 = list1[i];
                const team2 = list2[i];

                // Criação de atributos/Limpeza de dados desta rodada
                team1.win = false;
                team1.aTie = false;
                team1.double = false;
                team2.win = false;
                team2.aTie = false;
                team2.double = false;

                // Gols
                team1.goals = Math.floor(Math.random() * 5);
                team2.goals = Math.floor(Math.random() * 5);

                // Pontos
                if (team1.goals === team2.goals) {
                    team1.aTie = true;
                    team1.points += 1;
                    team2.aTie = true;
                    team2.points += 1;
                } else if (team1.goals > team2.goals) {
                    team1.win = true;
                    team1.points += 3;
                } else {
                    team2.win = true;
                    team2.points += 3;
                }

                // Em casa / Mando de jogo
                let team1home = {};
                let team2home = {};
                if (team1.home > team2.home) {
                    team2.home++;
                    team1home = team2;
                    team2home = team1;
                } else {
                    team1.home++;
                    team1home = team1;
                    team2home = team2;
                }

                // Rodada Dupla (parte 1/2)
                if (states.includes(team1home.state)) {
                    doubleRound.push(team1home.state);
                } else {
                    states.push(team1home.state);
                }

                results.push({ team1: team1home, team2: team2home });
            }

            // Rodada Dupla (parte 2/2)
            if (doubleRound.length) {
                for (const { team1 } of results) {
                    if (!doubleRound.includes(team1.state)) continue;
                    team1.double = true;
                }
            }

            return { results };
        },

        getChampion() {
            const { list1, list2 } = this.rounds.slice(-1)[0];
            const all = [...list1, ...list2];
            all.sort((a, b) => {
                if (a.points > b.points) return -1;
                if (b.points > a.points) return 1;
                return 0;
            });

            return all[0];
        },
    },
});
