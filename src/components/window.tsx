import './window_styles.css';
export default function Window (props) {
    return (<div className="card">
        <div className="tools">
            <div className="circle">
            <span className="red box"></span>
            </div>
            <div className="circle">
            <span className="yellow box"></span>
            </div>
            <div className="circle">
            <span className="green box"></span>
            </div>
        </div>
        <div className="card__content">
        </div>
        </div>);
}