import React, { useState } from 'react';
import { withTranslation } from 'react-i18next';
import { ButtonSolid } from '@/_ui/AppButton/AppButton';
import _, { capitalize } from 'lodash';
import { Tooltip } from 'react-tooltip';
import { FormWrapper, textAreaEnterOnSave } from '@/_components/FormWrapper';
import EyeHide from '../../assets/images/onboardingassets/Icons/EyeHide';
import EyeShow from '../../assets/images/onboardingassets/Icons/EyeShow';

const ConstantForm = ({
  selectedConstant,
  createOrUpdate,
  onCancelBtnClicked,
  isLoading,
  currentEnvironment,
  checkIfConstantNameExists,
  mode,
}) => {
  const [fields, setFields] = useState(() => ({
    ...selectedConstant,
    environments: [{ label: currentEnvironment?.name, value: currentEnvironment?.id }],
  }));

  const [showValue, setShowValue] = useState(false);

  const toggleShowValue = () => {
    setShowValue(!showValue);
  };

  const getDisplayedValue = () => {
    if (!fields['value']) {
      return '';
    }
    return showValue ? fields['value'] : '*'.repeat(fields['value'].length);
  };

  const darkMode = localStorage.getItem('darkMode') === 'true';

  const [error, setError] = useState({});

  function isValidPropertyName(name) {
    const validNameRegex = /^[a-zA-Z_][a-zA-Z0-9_]*$/;
    return validNameRegex.test(name);
  }

  const ERROR_MESSAGES = Object.freeze({
    name_already_exists: `Constant with this name already exists in ${capitalize(
      currentEnvironment?.name
    )} environment`,
    invalid_name_length: 'Constant name should be between 1 and 32 characters',
    max_name_length_reached: 'Maximum length has been reached',
    invalid_name:
      'Constant name should start with a letter or underscore and can only contain letters, numbers and underscores',
    invalid_value_length: 'Value should be less than 10000 characters and cannot be empty',
    invalid_value: 'This value is already in use. Please enter a different value',
  });

  const handleConstantNameError = (name, value) => {
    setError((prev) => ({ ...prev, [name]: null }));

    if (name !== 'name') return;

    const isNameAlreadyExists = checkIfConstantNameExists(value, currentEnvironment?.id);
    const invalidNameLength = value.length > 32;
    const maxNameLengthReached = value.length === 32;
    const invalidName = !isValidPropertyName(value);

    if (isNameAlreadyExists) {
      return setError({
        name: ERROR_MESSAGES.name_already_exists,
      });
    }
    if (invalidNameLength) {
      return setError({
        name: ERROR_MESSAGES.invalid_name_length,
      });
    }
    if (maxNameLengthReached) {
      return setError({
        name: ERROR_MESSAGES.max_name_length_reached,
      });
    }
    if (invalidName) {
      return setError({
        name: ERROR_MESSAGES.invalid_name,
      });
    }
  };

  const handleConstantValueError = (name, value) => {
    if (name !== 'value') return;

    const invalidValueLength = value.trim().length > 10000 || value.trim().length === 0;

    if (invalidValueLength) {
      setError((prev) => ({ ...prev, value: ERROR_MESSAGES.invalid_value_length }));
    }

    if (mode === 'edit' && value === selectedConstant.value) {
      setError((prev) => ({ ...prev, value: ERROR_MESSAGES.invalid_value }));
    }
  };

  const handleFieldChange = (e) => {
    const { name, value } = e.target;

    handleConstantNameError(name, value);
    handleConstantValueError(name, value);

    setFields((fields) => ({
      ...fields,
      [name]: value,
    }));
  };

  const isActiveErrorState = (state) => {
    if (!state?.name && !state?.value) return false;

    if (state?.name === ERROR_MESSAGES.max_name_length_reached) return false;

    return true;
  };
  const handlecreateOrUpdate = (e) => {
    e.preventDefault();

    if (isActiveErrorState(error) || error['value']) {
      return;
    }
    createOrUpdate(fields, mode === 'edit');
  };

  const shouldDisableButton =
    !isActiveErrorState(error) &&
    fields['name'] &&
    fields['value'] &&
    (fields['name'].length > 0 || fields['value'].length > 0)
      ? false
      : true;

  const [isOpen, setIsOpen] = useState(false);

  const inputRef = React.useRef(null);

  const handleInput = () => {
    const input = inputRef.current;
    if (fields['value'] && fields['value'].length > 30 && input) {
      input.style.height = 'auto';
      input.style.height = `${input.scrollHeight}px`;
      input.style.overflow = fields['value'].length >= 300 ? 'scroll' : 'hidden';
    }
  };

  const handleBlur = () => {
    setShowValue(false);
  };

  return (
    <div className="variable-form-wrap">
      <div className="card-header">
        <h3 className="card-title" data-cy="constant-form-title">
          {!selectedConstant ? 'Add new constant' : 'Update constant'} in {currentEnvironment?.name}{' '}
        </h3>
      </div>
      <div className="card-body org-constant-form">
        <FormWrapper callback={handlecreateOrUpdate} id="variable-form">
          <div className="form-group mb-3 ">
            <div className="d-flex mb-3">
              <div
                className="col tj-app-input"
                style={{
                  marginRight: '10px',
                }}
                onMouseEnter={() => setIsOpen(true)}
                onMouseLeave={() => setIsOpen(false)}
              >
                <label className="form-label" data-cy="name-label">
                  Name
                </label>
                <input
                  type="text"
                  className={`tj-input-element ${error['name'] ? 'tj-input-error-state' : ''}`}
                  placeholder={'Enter Constant Name'}
                  name="name"
                  onChange={handleFieldChange}
                  value={fields['name']}
                  disabled={!!selectedConstant}
                  data-tooltip-id="tooltip-for-org-input-disabled"
                  data-tooltip-content={'Cannot edit constant name'}
                  data-tooltip-offset={5}
                  data-cy="name-input-field"
                />
                <Tooltip id="tooltip-for-org-input-disabled" isOpen={!!selectedConstant && isOpen} place={'bottom'} />
                <span className="text-danger" data-cy="name-error-text">
                  {error['name']}
                </span>
              </div>
            </div>
            <div className="col tj-app-input">
              <div className="d-flex justify-content-between align-items-center w-100">
                <label className="form-label" data-cy="value-label">
                  Value
                </label>
                <small className="text-green d-flex align-items-center" data-cy="encrypted-label">
                  <img
                    className="encrypted-icon me-1"
                    src="assets/images/icons/padlock.svg"
                    alt="Encrypted"
                    width="12"
                    height="12"
                  />
                  Encrypted
                </small>
              </div>

              <div className="position-relative">
                <textarea
                  ref={inputRef}
                  type={'text'}
                  className={`tj-input-element ${error['value'] ? 'tj-input-error-state' : ''}`}
                  onChange={handleFieldChange}
                  name="value"
                  value={getDisplayedValue()}
                  placeholder={'Enter value'}
                  onKeyDown={(e) => textAreaEnterOnSave(e, handlecreateOrUpdate)}
                  readOnly={!showValue}
                  onInput={handleInput}
                  onFocus={() => {
                    setShowValue(true);
                    !!selectedConstant && handleInput();
                  }}
                  onBlur={handleBlur}
                  style={{
                    paddingRight: '35px',
                    height: !!selectedConstant && selectedConstant?.value?.length > 50 ? '300px' : '36px',
                    minHeight: '36px',
                    maxHeight: '500px',
                    whiteSpace: 'pre-line',
                    resize: 'none',
                    overflow: 'hidden',
                  }}
                  data-cy="value-input-field"
                />
                <div
                  onClick={() => toggleShowValue()}
                  data-cy="show-password-icon"
                  style={{
                    position: 'absolute',
                    top: 5,
                    right: '10px',
                    cursor: 'pointer',
                    zIndex: 2,
                  }}
                >
                  {!showValue ? (
                    <EyeHide
                      fill={
                        darkMode
                          ? String(fields['value'])?.length
                            ? '#D1D5DB'
                            : '#656565'
                          : String(fields['value'])?.length
                          ? '#384151'
                          : '#D1D5DB'
                      }
                    />
                  ) : (
                    <EyeShow
                      fill={
                        darkMode
                          ? String(fields['value'])?.length
                            ? '#D1D5DB'
                            : '#656565'
                          : String(fields['value'])?.length
                          ? '#384151'
                          : '#D1D5DB'
                      }
                      data-cy="test"
                    />
                  )}
                </div>
              </div>

              <span className="text-danger" data-cy="value-error-text">
                {error['value']}
              </span>
            </div>
          </div>
        </FormWrapper>
      </div>
      <div className="form-footer gap-2 variable-form-footer">
        <ButtonSolid onClick={onCancelBtnClicked} data-cy="cancel-button" variant="tertiary">
          Cancel
        </ButtonSolid>
        <ButtonSolid
          type="submit"
          isLoading={isLoading}
          disabled={isLoading || shouldDisableButton || selectedConstant?.value === fields['value']}
          data-cy="add-constant-button"
          form="variable-form"
        >
          {!selectedConstant ? 'Add constant' : 'Update'}
        </ButtonSolid>
      </div>
    </div>
  );
};
export default withTranslation()(ConstantForm);
