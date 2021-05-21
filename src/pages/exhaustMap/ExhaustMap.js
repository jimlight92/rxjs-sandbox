import { Card, CardContent } from "@material-ui/core";
import { useEffect, useState } from "react";
import { interval } from "rxjs";
import { exhaustMap, map, scan, startWith, takeWhile } from "rxjs/operators";
import FlatteningOperatorExample from "../../components/FlatteningOperatorExample";
import createEventStore from '../../services/event-store';

const INTERVAL = 100;

const store = createEventStore()

const observable$ = store.stream$.pipe(
    exhaustMap(({ id }) =>
        interval(INTERVAL).pipe(
            startWith(0),
            takeWhile(progress => progress <= 100),
            map(progress => ({
                id,
                progress
            }))
        )
    ),
    scan(
        (acc, curr) => ({
            ...acc,
            [curr.id]: curr.progress
        }),
        {}
    ),
    map(obj => Object.keys(obj).map(key => ({
        id: key,
        progress: obj[key]
    })))
)

const ExhaustMap = () => {
    const [state, setState] = useState([]);
    const [count, setCount] = useState(0);

    useEffect(() => {
        const sub = observable$.subscribe(setState);

        return () => {
            sub.unsubscribe();
        }
    }, [])

    const onTriggerClick = () => {
        setCount(count + 1)
        store.triggerEvent({ id: count + 1 });
    };

    const onCompleteClick = () => {
        store.complete();
    };

    return (
        <Card variant="outlined">
            <CardContent>
                <h2>exhaustMap</h2>
                <p>
                    Click the 'Trigger' button to push a value on to the outer observable. The progress bar that appears represents the inner observable
                    that is generated for each value on the outer observable.
                </p>
                <p>
                    The <i>exhaustMap</i> operator means that any values added to the outer observable (button clicks) will only trigger a new inner observable
                    (progress bar) if the previous one has <i>completed</i>.
                </p>
                <p>
                    If the outer observable completes, no further inner observables will be created but the inner observable will run to completion.
                    Note that the inner observable completes when the values reaches 100.
                </p>

                <FlatteningOperatorExample bars={state} onTrigger={onTriggerClick} onComplete={onCompleteClick} />

            </CardContent>
        </Card>
    );
}

export default ExhaustMap;
