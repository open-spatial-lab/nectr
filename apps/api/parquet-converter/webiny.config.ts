const nobuild = () => new Promise(async (resolve, reject) => {
  // resolve immediately
  resolve(true)
})


export default {
  commands: {
    build: nobuild,
    watch: nobuild
  }
}
