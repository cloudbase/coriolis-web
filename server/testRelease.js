const spawn = require('child_process').spawn

const TOTAL_SPAWN_STEPS = 7

const main = async () => {
  let currentSpawnStep = 0

  const logProgress = (message) => {
    currentSpawnStep += 1
    console.log(`\n\x1b[36m${currentSpawnStep}/${TOTAL_SPAWN_STEPS} ${message}...\x1b[0m\n`)
  }

  const spawnPromise = (command, args, message) => new Promise((resolve, reject) => {
    logProgress(message)
    const childProcess = spawn(command, args, { stdio: 'inherit' })
    childProcess.on('close', (code) => {
      if (code === 0) {
        resolve()
      } else {
        reject(new Error(`${command} ${args.join(' ')} exited with code ${code}`))
      }
    })
  })

  const spawnYarnStart = async (message) => new Promise((resolve, reject) => {
    logProgress(message)
    process.env.FORCE_COLOR = true
    const childProcess = spawn('yarn', ['start'], { env: process.env })
    childProcess.stdout.on('data', data => {
      process.stdout.write(data)
      if (data.toString().includes('server is up')) {
        console.log('\nContinue to next step? (Y/n)...')
      }
    })
    childProcess.stderr.on('data', data => { process.stderr.write(data) })
    process.stdin.setRawMode(true)
    process.stdin.once('data', data => {
      childProcess.kill()
      process.stdin.setRawMode(false)
      if (data.toString() === 'n') {
        reject(new Error('Aborted'))
      } else {
        resolve()
      }
    })
  })

  try {
    await spawnPromise('yarn', ['install'], 'Preparing install for TSC and ESLint checks')
    await spawnPromise('yarn', ['tsc'], 'Typescript checks')
    await spawnPromise('yarn', ['eslint'], 'ESLint checks')
    await spawnPromise('yarn', ['install', '--production'], 'Preparing install for production launch')
    await spawnPromise('yarn', ['build'], 'Production build')
    await spawnYarnStart('Production start')
    await spawnPromise('yarn', ['install'], 'Testing successful! Reverting to development install')
  } catch (e) {
    console.error(e)
  } finally {
    process.exit(0)
  }
}

main()
