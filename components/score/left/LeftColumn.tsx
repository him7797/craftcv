import OverallScoreBlock from './OverallScoreBlock'
import ProgressBlock from './ProgressBlock'
import SubScoresBlock from './SubScoresBlock'

export default function LeftColumn() {
  return (
    <>
      <OverallScoreBlock />
      <ProgressBlock />
      <SubScoresBlock />
    </>
  )
}
