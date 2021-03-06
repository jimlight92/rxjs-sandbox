import { Button, Card, CardContent, Grid, makeStyles, TextField } from '@material-ui/core';
import { useEffect, useRef, useState } from 'react';
import { debounceTime, filter, map, pluck, scan } from 'rxjs/operators';
import { webSocket } from 'rxjs/webSocket';

const useStyles = makeStyles((theme) => ({
    btn: {
        marginRight: theme.spacing(2),
        marginBottom: theme.spacing(2),
        marginTop: theme.spacing(2)
    }
}));

const obs$ = webSocket('wss://ws.finnhub.io?token=c2lrsuqad3ice2ned680');

function WebSocket() {
    const classes = useStyles();

    const [state, setState] = useState({});
    const [stockName, _setStockName] = useState('');

    const stockNameRef = useRef(stockName)

    const setStockName = state => {
        stockNameRef.current = state;
        _setStockName(state);
    }

    useEffect(() => {
        const sub = obs$
            .pipe(
                debounceTime(250),
                filter(v => v.type === 'trade'),
                pluck('data'),
                map(data => data.reduce((acc, curr) => ({
                    ...acc,
                    [curr.s]: curr.p
                }), {})),
                scan((acc, curr) => ({
                    ...acc,
                    ...Object.keys(curr).reduce((obj, key) => ({
                        ...obj,
                        [key]: {
                            value: curr[key],
                            change: acc.hasOwnProperty(key)
                                ? curr[key] - acc[key].value
                                : 0
                        }
                    }), {})
                }), {})
            )
            .subscribe(v => {
                console.log(v);
                setState(v);
            });

        return () => {
            sub.unsubscribe();
        }
    }, [])

    const onAddToFeed = () => {
        obs$.next({ type: "subscribe", symbol: stockNameRef.current });
    }

    return (
        <>
            <form>
                <TextField label="Stock" onChange={(e) => setStockName(e.currentTarget.value)} />
            </form>

            <Button className={classes.btn} variant="contained" color="primary" onClick={onAddToFeed}>Add to feed</Button>

            <Grid container spacing={3}>
                {
                    Object.keys(state).map(key => (
                        <Grid key={key} item xs={3}>
                            <Card>
                                <CardContent>
                                    <h3>{key}</h3>
                                    <h4>{state[key].value}</h4>
                                    <h5>{
                                        state[key].change > 0 ? '+' :
                                            state[key].change < 0 ? '-' :
                                                0
                                    }
                                    </h5>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))
                }
            </Grid>
        </>
    )
}

export default WebSocket
