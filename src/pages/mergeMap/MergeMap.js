import { mergeMap } from 'rxjs/operators';
import FlatteningStrategyDisplay from '../../components/FlatteningStrategyDisplay';
import withFlatteningStrategy from '../../components/HOCs/withFlatteningStrategy';

export default withFlatteningStrategy(mergeMap)(FlatteningStrategyDisplay)