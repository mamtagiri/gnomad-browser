import React, { PropTypes } from 'react'
import styled from 'styled-components'
import { connect } from 'react-redux'

import {
  actions as variantActions,
  selectedVariantDataset,
  variantFilter,
  variantQcFilter,
  variantSearchText,
} from '@broad/redux-variants'

import { actions as geneActions, exonPadding } from '@broad/redux-genes'

import {
  ClassicExacButton,
  ClassicExacButtonFirst,
  ClassicExacButtonLast,
  ClassicExacButtonGroup,

  SettingsContainer,
  MenusContainer,
  SearchContainer,
  DataSelectionGroup,
  DataSelectionContainer,

  Search,
} from '@broad/ui'

import { QuestionMark } from '@broad/help'

const GeneSettings = ({
  exonPadding,
  selectedVariantDataset,
  setExonPadding,
  searchVariants,
  setVariantFilter,
  variantFilter,
  setSelectedVariantDataset,
  toggleVariantQcFilter,
  variantQcFilter,
  variantSearchText,
}) => {
  const setPadding = (event, newValue) => {
    const padding = Math.floor(1000 * newValue)
    setExonPadding(padding)
  }

  const ClassicVariantCategoryButtonGroup = () => (
    <ClassicExacButtonGroup>
      <ClassicExacButtonFirst
        isActive={variantFilter === 'all'}
        onClick={() => setVariantFilter('all')}
      >
        All
      </ClassicExacButtonFirst>
      <ClassicExacButton
        isActive={variantFilter === 'missenseOrLoF'}
        onClick={() => setVariantFilter('missenseOrLoF')}
      >
        Missense + LoF
      </ClassicExacButton>
      <ClassicExacButtonLast
        isActive={variantFilter === 'lof'}
        onClick={() => setVariantFilter('lof')}
      >
        LoF
      </ClassicExacButtonLast>
    </ClassicExacButtonGroup>
  )

  return (
    <SettingsContainer>
      <MenusContainer>
        <DataSelectionGroup>
          <ClassicVariantCategoryButtonGroup />
          <DataSelectionContainer>
            <select
              onChange={event => setSelectedVariantDataset(event.target.value)}
              value={selectedVariantDataset}
            >
              <option value="gnomadExomeVariants">gnomAD exomes</option>
              <option value="gnomadGenomeVariants">gnomAD genomes</option>
              <option value="gnomadCombinedVariants">gnomAD</option>
              <option value="exacVariants">ExAC</option>
            </select>
            <QuestionMark topic={'dataset-selection'} display={'inline'} />
          </DataSelectionContainer>
        </DataSelectionGroup>
        <DataSelectionGroup>
          <form>
            <div>
              <input
                id="qcFilter"
                type="checkbox"
                checked={!variantQcFilter}
                onChange={event => toggleVariantQcFilter()}
              />
              <label style={{ marginLeft: '5px' }} htmlFor="qcFilter">
                Include filtered variants
              </label>
              <QuestionMark topic={'include-filtered-variants'} display={'inline'} />
            </div>
          </form>
          <SearchContainer>
            <Search
              placeholder={'Search variant table'}
              onChange={searchVariants}
              withKeyboardShortcuts
            />
          </SearchContainer>
        </DataSelectionGroup>
      </MenusContainer>
    </SettingsContainer>
  )
}

GeneSettings.propTypes = {
  selectedVariantDataset: PropTypes.string.isRequired,
  exonPadding: PropTypes.number.isRequired,
  setExonPadding: PropTypes.func.isRequired,
  searchVariants: PropTypes.func.isRequired,
  setVariantFilter: PropTypes.func.isRequired,
  setSelectedVariantDataset: PropTypes.func.isRequired,
}

const mapStateToProps = (state) => {
  return {
    exonPadding: exonPadding(state),
    selectedVariantDataset: selectedVariantDataset(state),
    variantQcFilter: variantQcFilter(state),
    variantFilter: variantFilter(state),
    // variantSearchText: variantSearchText(state),
  }
}
const mapDispatchToProps = (dispatch) => {
  return {
    setExonPadding: padding => dispatch(geneActions.setExonPadding(padding)),
    setVariantFilter: filter => dispatch(variantActions.setVariantFilter(filter)),
    searchVariants: searchText =>
      dispatch(variantActions.searchVariants(searchText)),
    setSelectedVariantDataset: dataset =>
      dispatch(variantActions.setSelectedVariantDataset(dataset)),
    toggleVariantQcFilter: () =>
      dispatch(variantActions.toggleVariantQcFilter()),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(GeneSettings)
