import './App.css'
import './helpers/agora'

function App() {
  return (
    <>
      <h2 className="left-align">Agora Web SDK Quickstart</h2>
      <div className="row">
        <div>
          <button type="button" id="host-join">
            Join as host
          </button>
          <button type="button" id="audience-join">
            Join as audience
          </button>
          <button type="button" id="leave">
            Leave
          </button>
        </div>
      </div>
    </>
  )
}

export default App
