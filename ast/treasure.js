'use strict';


const store = new Vuex.Store({
  state: {
    game: true,
    guardBodyMessage: "Welcome abord, young fella! We gonna search "
      + "some treasure today! So, where will we start? Just click on "
      + "desired place to expedition!",
    expeditions: 0,
    expeditionsMessage: "Expeditions: 0 of 10",
    markClose: 0,
    markMessage: "There is no mark yet.",
    maxExpeditions: 10,
    restartMessage: "Restart",
    showDisclaimer: false,
    showModal: true,
    treasureLocation: [0, 0],

    zMessagesBody: [],
    zMessagesMark: [],
  },
  mutations: {
    clickListener: state => {
      document.addEventListener('click', ((evt)=>{
        if (state.game && evt.target.tagName=='BODY')
          store.dispatch('expedition', evt);
      }).bind(this))
    },

    createMark: (state, evt) => {
      let tx = state.treasureLocation[0];
      let ty = state.treasureLocation[1];
      let x = evt.clientX;
      let y = evt.clientY;
      let distance = Math.floor(((tx-x)**2 + (ty-y)**2) ** 0.5);

      store.dispatch('drawMark', {distance, x, y});
    },

    drawMark: (state, point) => {
      let mark = document.createElement('span');
      mark.classList.add('treasure-mark');
      mark.textContent = state.expeditions;
      mark.style.left = point.x + "px";
      mark.style.top = point.y + "px";

      let markClose = (element, color, obj, value) => {
        element.style.borderColor = color;
        obj.markClose = value;
        store.dispatch('setMessages');
        document.body.appendChild(element);
      };

      let toMark = point.distance;
      if (toMark > 500) markClose(mark, "red", state, 0);
      else if (toMark > 250) markClose(mark, "blue", state, 1);
      else if (toMark > 100) markClose(mark, "green", state, 2);
      else if (toMark > 25) markClose(mark, "gold", state, 3);
      else if (toMark <= 25) store.dispatch('winGame');
    },

    expedition: (state, evt) => {
      let expeditions = ++state.expeditions;
      let message = state.expeditionsMessage;
      state.expeditionsMessage = message.slice(0,13) + expeditions + " of 10";
      store.dispatch('createMark', evt);
      expeditions >= 10 && state.game ? store.dispatch('gameOver') : "";
    },

    gameOver: state => {
      state.game = false;
      state.guardBodyMessage = "It's over! We did all that we can.";
      state.expeditionsMessage = "No more expeditions left :(";
      state.markMessage = "We were so close...";
      state.restartMessage = "Play Again!";
      state.showDisclaimer = true;
    },

    restart: state => {
      let img = document.getElementsByTagName('img');
      if (img.length)
        document.body.removeChild(img[0]);

      let marks = document.getElementsByClassName('treasure-mark');
      let length = marks.length - 1;
      for (let i = length; i >= 0; i--)
        document.body.removeChild(marks[i]);

      state.game = true;
      state.guardBodyMessage = "Welcome abord, young fella! We gonna search "
      + "some treasure today! So, where will we start? Just click on "
      + "desired place to expedition!";
      state.expeditions = 0;
      state.expeditionsMessage = "Expeditions: 0 of 10";
      state.markClose = 0;
      state.markMessage = "There is no mark yet.";
      state.restartMessage = "Restart";
      state.showDisclaimer = false;
      state.showModal = true;
      store.dispatch('setTreasureLocation');
    },

    setMessages: (state) => {
      switch (state.markClose) {
        case 0:
          state.guardBodyMessage = "Let's try another one, maybe we'll get lucky next time.";
          state.markMessage = "That mark was so far away from treasure. I guarantee.";
          break;
        case 1:
          state.guardBodyMessage = "Not bad at all, but still..no..treasure..";
          state.markMessage = "We getting somewhere and I feel treasure somewhere..";
          break;
        case 2:
          state.guardBodyMessage = "Hm, if we stop now - it will be complete disapointment for me.";
          state.markMessage = "So close but not enough! We must search for a Golden Circles.";
          break;
        case 3:
          state.guardBodyMessage = "LET'S FIND IT!";
          state.markMessage = "It's a Golden Circle! We're almost here, I feel it with my heart!";
          break;
      }
    },

    setTreasureLocation: state => {
      let random = (num) => Math.floor(Math.random() * num);
      let height = document.body.offsetHeight;
      let width = document.body.offsetWidth;
      state.treasureLocation = [random(width), random(height)];
    },

    showDisclaimer: state => state.showDisclaimer = !state.showDisclaimer,
    showModal: state => state.showModal = !state.showModal,

    winGame: state => {
      let img = document.createElement("img");
      img.classList.add('treasure');
      img.style.left = state.treasureLocation[0] + "px";
      img.style.top = state.treasureLocation[1] + "px";
      img.src = "ast/red-cross.png";
      document.body.appendChild(img);

      state.guardBodyMessage = "HURRAY! We found it! We finally found it!"
        + "We're rich and famous now!";
      state.expeditionsMessage = "Expedition №" + state.expeditions
        + " was lucky one!";
      state.markMessage = "We found it there!";
      state.showDisclaimer = true;
      state.restartMessage = "Play Again!";
      state.game = false;
    }
  },
  actions: {
    clickListener: ({commit}) => commit('clickListener'),
    createMark: ({commit}, evt) => commit('createMark', evt),
    drawMark: ({commit}, point) => commit('drawMark', point),
    expedition: ({commit}, evt) => commit('expedition', evt),
    gameOver: ({commit}) => commit('gameOver'),
    restart: ({commit}) => commit('restart'),
    setMessages: ({commit}) => commit('setMessages'),
    setTreasureLocation: ({commit}) => commit('setTreasureLocation'),
    showDisclaimer: ({commit}) => commit('showDisclaimer'),
    showModal: ({commit}) => commit('showModal'),
    winGame: ({commit}) => commit('winGame'),
  }
});


Vue.component('modal-component',{
  template: `
<transition name="modal">
  <div class="modal-mask">
    <div class="modal-wrapper">
      <div class="modal-container">

        <div class="modal-header">
          <h3>
            Treasure Hunting!
          </h3>
        </div>

        <div class="modal-body">
          <slot name="body">
            You are here, in the secret lands and your goal is to find
            ancient treasure of Nandakuku! Listen your guard-body well
            and you can definetly find it one day! I believe in you.
          </slot>
        </div>

        <div class="modal-footer">
          <slot name="footer">
            Guard-body dialog window at the right-top. To mark lands
            and search for treasure just click on the map. You have
            limited resourses for 10 expeditions! So don't lose it
            for "Cold-away" places and go right into "Hot" ones.

            <div align="center">
              <button class="modal-default-button"
                @click="$emit('close')">
                Got it!
              </button>
            </div>
          </slot>
        </div>
      </div>
    </div>
  </div>
</transition>`
});


Vue.component('disclaimer-component', {
  props: ['bodyMessage', 'expeditionsMessage', 'lastMark', 'restartMessage'],
  template: `
<div>
  <fieldset
      class="content__disclaimer open">
    <legend>Guard Body</legend>
      <p>{{bodyMessage}}</p>
      <p>{{expeditionsMessage}}</p>
      <p>{{lastMark}}</p>
      <span title="Скрыть дисклеймер"
          class="content__disclaimer_control d__closer"
          @click="$emit('disclaimer')">⌧</span>
        <button id="restart"
          @click="$emit('restart')">{{restartMessage}}
        </button>
        <button id="show-modal"
          @click="$emit('modal')">Show Welcome
        </button>
  </fieldset>
</div>`
});


const treasureApp = new Vue({
  el: '#treasure-app',
  store,
  computed: Vuex.mapState({
    disclaimer: state => state.showDisclaimer,
    bodyMessage: state => state.guardBodyMessage,
    expeditionsMessage: state => state.expeditionsMessage,
    game: state => state.game,
    markMessage: state => state.markMessage,
    modal: state => state.showModal,
    restartMessage: state => state.restartMessage,
  }),
  methods: Vuex.mapActions([
    'restart', 'showDisclaimer', 'showModal',
  ]),
  mounted: () => {
    store.dispatch('clickListener');
    store.dispatch('setTreasureLocation');
  },
  template: `
<div id="app">
  <disclaimer-component
      v-if="disclaimer"
      v-bind:bodyMessage="bodyMessage"
      v-bind:expeditionsMessage="expeditionsMessage"
      v-bind:lastMark="markMessage"
      v-bind:restartMessage = "restartMessage"
      @disclaimer="showDisclaimer()"
      @modal="showModal()"
      @restart="restart()" />

  <span title="Показать дисклеймер"
      v-if="!disclaimer"
      @click="showDisclaimer()"
      class="content__disclaimer_control d__opener">
    ❔ Guard Body ❔
  </span>

  <modal-component
      v-if="modal"
      @close="showModal()" />
</div>`
});
