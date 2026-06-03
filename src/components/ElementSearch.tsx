import Autocomplete from "@mui/material/Autocomplete";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import styled from "styled-components";
import { AutocompleteOption } from "../lib/Data";

type ElementSearchProps = {
  isLoading: boolean;
  options: AutocompleteOption[];
  selectedOption: AutocompleteOption | null;
  onSelect: (elementID: string | undefined) => void;
};

export const ElementSearch = ({ isLoading, options, selectedOption, onSelect }: ElementSearchProps) => (
  <Autocomplete
    disablePortal
    loading={isLoading}
    isOptionEqualToValue={(option, value) => option.id === value.id}
    options={options}
    sx={{ width: 300 }}
    value={selectedOption}
    renderOption={(props, option) => (
      <Box component={"li"} sx={{ "& > img": { mr: 2, flexShrink: 0 } }} {...props}>
        <AutoCompleteIcon loading={"lazy"} src={option.image} alt={""} />
        {option.label}
      </Box>
    )}
    renderInput={(params) => <TextField {...params} label={"Elements"} />}
    onChange={(_event, option) => {
      onSelect(option?.id);
    }}
  />
);

const AutoCompleteIcon = styled.img`
  width: 20px;
  filter: drop-shadow(0 0 0 rgba(0, 0, 0, 0.5));
`;
